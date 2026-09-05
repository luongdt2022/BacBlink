/**
 * Nghiệm thu trên trình duyệt thật — lịch sử vòng ghép cặp, chi tiết một vòng, trang so sánh hai vòng, và cảnh
 * báo "đề bài đã có phiên bản mới hơn" trên console hồ sơ.
 *
 * Không có Elasticsearch và sidecar nhúng ở máy này, nên các vòng được **chèn thẳng vào PostgreSQL** với đúng
 * hình dạng mà `MatchRound.Complete` / `MatchRound.Import` tạo ra. Cái được đo là màn hình và API đọc, không
 * phải thuật toán tính vòng — B-27 vẫn chờ sidecar.
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

async function api(path, opts = {}, token, extra = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra } })
  const t = await res.text(); return { status: res.status, body: t ? JSON.parse(t) : null }
}

function insertRound({ subjectKind, subjectId, engine, mode, query, authoritative, at, candidates }) {
  const id = randomUUID()
  psql(`INSERT INTO matching.match_rounds (id, subject_kind, subject_id, search_engine_version, embedding_model_version, scoring_mode, query_text, is_authoritative, completed_at, version, created_at, updated_at) VALUES ('${id}','${subjectKind}','${subjectId}','${engine}','bge-m3','${mode}',${query === null ? 'NULL' : `'${query}'`},${authoritative},'${at}',1,'${at}','${at}')`)
  candidates.forEach((c, i) => {
    psql(`INSERT INTO matching.match_candidates (id, round_id, candidate_kind, candidate_id, raw_score, matched_chunk, chunk_index, rank, reason, computed_at, updated_at) VALUES ('${randomUUID()}','${id}','TECHNOLOGY_ASSET','${c.id}',${c.score},'${c.chunk}',0,${i + 1},'${c.reason}','${at}','${at}')`)
  })
  return id
}

async function main() {
  const adminEmail = `rounds${S}@example.com`
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email: adminEmail, password: PASS, confirmPassword: PASS, firstName: 'Vong', lastName: 'Ghep' }) })
  psql(`UPDATE identity.persons SET is_active=true, platform_role='ADMIN' WHERE email='${adminEmail}'`)
  const adminId = psql(`SELECT id FROM identity.persons WHERE email='${adminEmail}'`)
  const tok = (await api('/api/v1/admin/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password: PASS }) })).body.accessToken

  // ── Đề bài thật (v1), rồi hồ sơ ghim phiên bản 1, rồi sửa đề bài → phiên bản 2 ──
  const form = new FormData()
  form.set('type', 'challenge')
  form.set('title', `Đề bài nghiệm thu ${S}`)
  form.set('description', 'Mô tả ban đầu')
  const intake = await api('/api/v1/my/intakes', { method: 'POST', body: form }, tok)
  const demandId = intake.body?.id ?? intake.body?.data?.id
  check('dàn dựng: tạo đề bài qua v1', intake.status === 201 && Boolean(demandId), `${intake.status}`)
  const head1 = await api(`/api/v2/demand-briefs/${demandId}`, {}, tok)
  check('GET /api/v2/demand-briefs/{id} → 200 kèm currentVersionNo', head1.status === 200 && head1.body.currentVersionNo === 1, `${head1.status} v${head1.body?.currentVersionNo}`)

  const created = await api('/api/v2/cases', { method: 'POST', body: JSON.stringify({
    track: 'CHALLENGE_PILOT', title: `Hồ sơ so vòng ${S}`, problemOwnerPersonId: adminId, demandBriefId: demandId,
    demandBriefVersionNo: 1, confidentialityLevel: 'CONFIDENTIAL', leadBrokerPersonId: adminId,
  }) }, tok, { 'Idempotency-Key': randomUUID() })
  const caseId = created.body.id
  // v1 sửa bằng multipart ([FromForm]); gửi JSON thì 200 mà không đổi gì — B-05 họ hàng.
  const edit = new FormData()
  edit.set('title', `Đề bài nghiệm thu ${S} (sửa)`)
  edit.set('description', 'Mô tả đã sửa — nội dung đổi thì mới có phiên bản mới')
  const patch = await api(`/api/v1/my/intakes/${demandId}`, { method: 'PATCH', body: edit }, tok)
  const head2 = await api(`/api/v2/demand-briefs/${demandId}`, {}, tok)
  check('dàn dựng: sửa đề bài → phiên bản 2', patch.status === 200 && head2.body.currentVersionNo === 2, `${patch.status} v${head2.body?.currentVersionNo}`)

  // ── Ba vòng cho hồ sơ: cũ (legacy), mới (corrected, đang dùng), và một vòng nhập từ hệ cũ ──
  const c1 = randomUUID(), c2 = randomUUID(), c3 = randomUUID()
  const legacy = insertRound({ subjectKind: 'COMMERCIALIZATION_CASE', subjectId: caseId, engine: 'elasticsearch-8.17/legacy-scoring', mode: 'LEGACY_SCORING', query: 'câu hỏi cũ', authoritative: false, at: '2026-09-01T00:00:00Z',
    candidates: [{ id: c1, score: 9.5, chunk: 'đoạn cũ của c1', reason: 'hybrid_knn_bm25' }, { id: c2, score: 3.1, chunk: 'đoạn cũ của c2', reason: 'hybrid_knn_bm25' }] })
  const corrected = insertRound({ subjectKind: 'COMMERCIALIZATION_CASE', subjectId: caseId, engine: 'elasticsearch-8.17/corrected-rrf', mode: 'CORRECTED_SCORING', query: 'câu hỏi mới', authoritative: true, at: '2026-09-02T00:00:00Z',
    candidates: [{ id: c2, score: 0.0325, chunk: 'đoạn mới của c2', reason: 'rrf_dense_lexical' }, { id: c3, score: 0.0161, chunk: 'đoạn mới của c3', reason: 'rrf_dense_lexical' }] })
  const imported = insertRound({ subjectKind: 'COMMERCIALIZATION_CASE', subjectId: caseId, engine: 'nestjs-intake_matches/imported', mode: 'LEGACY_SCORING', query: null, authoritative: false, at: '2026-08-01T00:00:00Z',
    candidates: [{ id: c1, score: 7.0, chunk: 'đoạn nhập', reason: 'legacy_hybrid_knn_bm25' }] })

  // ── API: liệt kê, lọc, đọc theo định danh, ứng viên theo hạng, 404 khi không đọc được ──
  console.log('\n════ API vòng ════')
  const list = await api(`/api/v2/subjects/commercialization-cases/${caseId}/match-rounds`, {}, tok)
  check('GET .../match-rounds: 3 vòng, mới nhất trước', list.status === 200 && list.body.total === 3 && list.body.data[0].id === corrected, `${list.status} total=${list.body?.total}`)
  const onlyLegacy = await api(`/api/v2/subjects/commercialization-cases/${caseId}/match-rounds?scoringMode=LEGACY_SCORING`, {}, tok)
  check('lọc scoringMode=LEGACY_SCORING → 2 vòng (kể cả vòng nhập)', onlyLegacy.body.total === 2)
  const one = await api(`/api/v2/match-rounds/${legacy}`, {}, tok)
  check('GET /api/v2/match-rounds/{id}: queryText và isAuthoritative lộ ra', one.status === 200 && one.body.queryText === 'câu hỏi cũ' && one.body.isAuthoritative === false)
  const cands = await api(`/api/v2/match-rounds/${legacy}/candidates`, {}, tok)
  check('ứng viên của MỘT vòng theo hạng tăng dần', cands.body.data.map((c) => c.rank).join(',') === '1,2' && cands.body.data[0].candidate.id === c1)
  const missing = await api(`/api/v2/match-rounds/${randomUUID()}`, {}, tok)
  check('vòng không tồn tại → 404', missing.status === 404)
  const stranger = `stranger${S}@example.com`
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email: stranger, password: PASS, confirmPassword: PASS, firstName: 'La' }) })
  psql(`UPDATE identity.persons SET is_active=true WHERE email='${stranger}'`)
  const stok = (await api('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email: stranger, password: PASS }) })).body.accessToken
  const denied = await api(`/api/v2/match-rounds/${legacy}`, {}, stok)
  check('người không đọc được hồ sơ → 404 (không phải 403) cho vòng của hồ sơ đó', denied.status === 404, `${denied.status}`)

  // ── Trình duyệt ──
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

  console.log('\n════ console hồ sơ: đề bài có bản mới hơn ════')
  await page.goto(`${UI}/cases/${caseId}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Đề bài đã có phiên bản 2', { timeout: 15000 })
  check('cảnh báo "đề bài đã có phiên bản 2", hồ sơ vẫn đọc phiên bản 1', (await page.textContent('body')).includes('Hồ sơ vẫn đọc phiên bản 1'))
  await page.screenshot({ path: `${OUT}/r1-demand-newer.png` })

  console.log('\n════ lịch sử vòng + bộ lọc trong URL ════')
  await page.goto(`${UI}/match-rounds/commercialization-cases/${caseId}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Các vòng đã tính', { timeout: 15000 })
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Các vòng đã tính"] tbody tr').length === 3, null, { timeout: 15000 })
  let body = await page.textContent('body')
  check('vòng đang dùng (corrected) hiện ở phần đầu với 2 ứng viên', body.includes('Chấm điểm đã sửa') && body.includes('Số ứng viên'))
  check('lịch sử liệt kê 3 vòng, có nhãn "đang dùng" và vòng nhập từ hệ cũ đánh dấu', body.includes('đang dùng') && body.includes('Nhập từ hệ cũ'))
  await page.selectOption('#rh-mode', 'LEGACY_SCORING')
  await page.waitForFunction(() => location.search.includes('scoringMode=LEGACY_SCORING'), null, { timeout: 5000 })
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Các vòng đã tính"] tbody tr').length === 2, null, { timeout: 15000 })
  check('bộ lọc chế độ nằm trong URL và lọc còn 2 vòng', true, page.url())
  await page.screenshot({ path: `${OUT}/r2-rounds-history.png`, fullPage: true })
  await page.selectOption('#rh-mode', '')
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Các vòng đã tính"] tbody tr').length === 3, null, { timeout: 15000 })

  console.log('\n════ chi tiết một vòng ════')
  await page.goto(`${UI}/match-rounds/rounds/${legacy}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Đã tìm bằng gì', { timeout: 15000 })
  body = await page.textContent('body')
  check('chi tiết vòng: câu truy vấn, ứng viên theo hạng, điểm thô kiểu cũ 2 chữ số', body.includes('câu hỏi cũ') && body.includes('9.50') && body.includes('3.10'))
  await page.goto(`${UI}/match-rounds/rounds/${imported}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Đã tìm bằng gì', { timeout: 15000 })
  body = await page.textContent('body')
  check('vòng nhập từ hệ cũ: dải cảnh báo + "không có câu truy vấn"', body.includes('Vòng nhập từ hệ cũ') && body.includes('không có câu truy vấn'))

  console.log('\n════ so sánh: legacy vs corrected ════')
  await page.goto(`${UI}/match-rounds/compare?a=${legacy}&b=${corrected}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('section[aria-label="Ứng viên hợp nhất"] tbody tr', { timeout: 15000 })
  body = await page.textContent('body')
  check('kết luận: khác trục → "có phần đến từ thuật toán" và không tách được', body.includes('có phần đến từ thuật toán') && body.includes('không tách được'))
  check('điểm KHÔNG trừ cho nhau khi khác chế độ (không có cột B − A)', body.includes('không trừ cho nhau') && (await page.locator('th:has-text("B − A")').count()) === 0)
  const rows = await page.locator('section[aria-label="Ứng viên hợp nhất"] tbody > tr').count()
  const presence = await page.locator('section[aria-label="Ứng viên hợp nhất"] tbody td:nth-child(4) span').allTextContents()
  check('bảng hợp nhất 3 bản ghi: chỉ A / cả hai / chỉ B', rows === 3 && presence.join('|') === 'chỉ A|cả hai|chỉ B', `${rows} dòng: ${presence.join('|')}`)
  check('giải thích vòng cũ ít ứng viên hơn không phải vì dữ liệu nghèo', body.includes('không có nghĩa là dữ liệu đã giàu lên'))
  await page.click('section[aria-label="Ứng viên hợp nhất"] tbody tr:nth-child(2) button:has-text("Đoạn khớp")')
  await page.waitForSelector('text=đoạn mới của c2', { timeout: 5000 })
  check('đoạn khớp hiện được cho từng bên', (await page.textContent('body')).includes('đoạn cũ của c2'))
  await page.screenshot({ path: `${OUT}/r3-compare.png`, fullPage: true })

  console.log('\n════ so sánh với vòng nhập từ hệ cũ ════')
  await page.goto(`${UI}/match-rounds/compare?a=${imported}&b=${legacy}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('section[aria-label="Kết luận"]', { timeout: 15000 })
  body = await page.textContent('body')
  check('một bên nhập từ hệ cũ → "Không kết luận được", dù cùng nhãn chế độ', body.includes('Không kết luận được') && body.includes('hai bên không cùng loại'))
  await page.screenshot({ path: `${OUT}/r4-compare-imported.png` })

  console.log(`\n════ Lỗi console: ${errors.length} ════`)
  errors.slice(0, 5).forEach((e) => console.log(`  ! ${e.slice(0, 160)}`))
  await browser.close()
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
