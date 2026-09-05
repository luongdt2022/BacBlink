/**
 * §26.6.6 — tám ca đúng/sai, đo trên bản chạy với mô hình BGE-M3 thật, chỉ mục PostgreSQL bốn kênh, chế độ
 * CORRECTED_SCORING + sparse (+ rerank nếu bật). Pass/fail, không tính điểm.
 *
 * Viết bằng Node chứ không phải bash: `curl --form-string` trên Git Bash/Windows gửi tiếng Việt thành mojibake
 * (bằng chứng: bản ghi tạo bằng bash không khớp `ILIKE '%công nghệ sinh học%'` trong PostgreSQL), và phép đo
 * về dấu tiếng Việt mà dữ liệu vào đã sai dấu thì vô nghĩa. `fetch` + `FormData` gửi UTF-8 đúng.
 *
 * Cần: API 5199 (CORRECTED_SCORING, UseSparse), sidecar 8003, container nacentech-postgres-1.
 */
import { execSync } from 'node:child_process'

const API = 'http://127.0.0.1:5199'
const S = Date.now()
const PASS = 'Matkhau@123'
const psql = (q) => execSync(`docker exec nacentech-postgres-1 psql -U postgres -d nacentech -tAc "${q.replace(/"/g, '\\"')}"`).toString().trim()
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(path, opts = {}, token, extra = {}) {
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra } })
  const t = await res.text(); return { status: res.status, body: t ? JSON.parse(t) : null }
}
async function reg(email) {
  await api('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password: PASS, confirmPassword: PASS, firstName: 'SC' }) })
  psql(`UPDATE identity.persons SET is_active=true WHERE email='${email}'`)
  return (await api('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password: PASS }) })).body.accessToken
}
async function mk(tok, title, content, extra = {}, status = 'published') {
  const f = new FormData(); f.set('type', 'ip'); f.set('title', title); f.set('content', `<p>${content}</p>`); f.set('status', status)
  for (const [k, v] of Object.entries(extra)) f.set(k, v)
  const r = await api('/api/v1/my/intakes', { method: 'POST', body: f }, tok); return r.body?.id ?? r.body?.data?.id
}
let Q
const search = async (query) => (await api('/api/v1/search', { method: 'POST', body: JSON.stringify({ query, limit: 10 }) }, Q)).body?.hits ?? []
const ids = (hits) => hits.map((h) => h.intakeId)
const top1Has = (hits, phrase) => hits.length > 0 && `${hits[0].title} ${hits[0].matchedChunk}`.toLowerCase().includes(phrase.toLowerCase())
const show = (hits) => hits.slice(0, 3).map((h) => `${h.title.slice(0, 28)}(${h.score.toFixed(3)})`).join(' · ')

async function main() {
  const OWNER = await reg(`sc-owner${S}@example.com`); Q = await reg(`sc-query${S}@example.com`)
  const T = String(S)
  const A1 = await mk(OWNER, `Sinh học cụm ${T}`, `ứng dụng công nghệ sinh học trong xử lý rác hữu cơ ${T}`)
  const A2 = await mk(OWNER, `Rời nhau ${T}`, `công nghệ mới giúp học sinh nông thôn tiếp cận thư viện số ${T}`)
  const C1 = await mk(OWNER, `Hòa tan ${T}`, `chất hòa tan nhanh trong nước lạnh cho ngành dược ${T}`)
  const C2 = await mk(OWNER, `Hoa tan ${T}`, `giống hoa tan mùa cho vùng cao nguyên ${T}`)
  const D1 = await mk(OWNER, `Điều hòa ${T}`, `hệ thống điều hòa không khí tiết kiệm điện cho nhà xưởng ${T}`)
  const E1 = await mk(OWNER, `IoT ${T}`, `cảm biến IoT giám sát độ ẩm đất cho nông trại thông minh ${T}`)
  const F1 = await mk(OWNER, `Máy sấy ${T}`, `Bằng sáng chế số VN1-0012345 do Viện Hàn lâm KHCN cấp cho máy sấy lạnh ${T}`)
  const F2 = await mk(OWNER, `Máy khác ${T}`, `Bằng sáng chế số VN1-0098765 cho máy ép ${T}`)
  const SECRET = `bimatcapba${T}`
  const H1 = await mk(OWNER, `Có phần mật ${T}`, `pin nhiên liệu hydro cho xe tải ${T}`, { confidentialLevel3Content: `<p>Công thức chất xúc tác ${SECRET}</p>` })
  const all = [A1, A2, C1, C2, D1, E1, F1, F2, H1]
  let n = 0
  for (let i = 0; i < 80; i++) { n = Number(psql(`SELECT count(*) FROM matching.search_chunks WHERE subject_id IN (${all.map((x) => `'${x}'`).join(',')})`)); if (n >= 9) break; await sleep(3000) }
  check('dàn dựng: 9 bản ghi đã vào bản chiếu, đúng UTF-8', n >= 9 && Number(psql(`SELECT count(*) FROM matching.search_chunks WHERE subject_id='${A1}' AND text ILIKE '%công nghệ sinh học%'`)) === 1, `${n} dòng`)

  console.log('════ §26.6.6 ════')
  let R = await search('công nghệ sinh học')
  check('1. cụm âm tiết: hạng 1 chứa "công nghệ sinh học"; bản "công nghệ … học" rời nhau không ở hạng 1', top1Has(R, 'công nghệ sinh học') && ids(R)[0] !== A2, show(R))
  R = await search('cong nghe sinh hoc')
  check('2. không dấu khớp có dấu', ids(R).includes(A1), show(R))
  R = await search('hòa tan')
  // Chỉ mục chuẩn hoá về kiểu đặt dấu mới ("hoà"), nên phép so nhận cả hai kiểu.
  check('3. gõ đủ dấu giữ phân biệt: hạng 1 là "hòa tan"/"hoà tan", không phải "hoa tan"', (top1Has(R, 'hòa tan') || top1Has(R, 'hoà tan')) && !top1Has(R, 'hoa tan m'), show(R))
  const R1 = await search(`điều hoà không khí ${T}`); const R2 = await search(`điều hòa không khí ${T}`.normalize('NFD'))
  check('4. "hoà"/"hòa" và NFC/NFD cho cùng kết quả', ids(R1).includes(D1) && ids(R2).includes(D1) && ids(R1)[0] === ids(R2)[0], `${show(R1)} || ${show(R2)}`)
  R = await search(`cảm biến IoT ${T}`)
  check('5. từ tiếng Anh trong câu tiếng Việt tìm được', ids(R).includes(E1), show(R))
  R = await search('VN1-0012345')
  check('6. số hiệu bằng sáng chế: hạng 1 mang đúng VN1-0012345 (bản số khác có thể theo sau qua kênh dense)', top1Has(R, 'VN1-0012345'), show(R))
  R = await search('Viện Hàn lâm KHCN')
  check('6b. tên tổ chức nguyên văn tìm thấy', ids(R).includes(F1), show(R))

  const DRAFTER = await reg(`sc-drafter${S}@example.com`)
  for (let j = 0; j < 20; j++) await mk(DRAFTER, `Nháp ${j} ${T}`, `gạch không nung từ tro bay ${T}`, {}, 'draft')
  const G1 = await mk(OWNER, `Gạch ${T}`, `gạch không nung từ tro bay nhiệt điện ${T}`)
  let m = 0
  for (let i = 0; i < 60; i++) { m = Number(psql(`SELECT count(*) FROM matching.search_chunks WHERE title LIKE '%${T}' AND text LIKE '%tro bay%'`)); if (m >= 21) break; await sleep(3000) }
  R = await search(`gạch không nung từ tro bay ${T}`)
  check('7. lọc cứng trước top-K: bản đã xuất bản không bị 20 bản nháp chiếm chỗ', ids(R).includes(G1) && !ids(R).some((x) => x !== G1 && psql(`SELECT is_published FROM matching.search_chunks WHERE subject_id='${x}' LIMIT 1`) === 'f'), `${m} dòng tro bay trong bản chiếu; ${show(R)}`)

  R = await search(SECRET)
  const inIdx = Number(psql(`SELECT count(*) FROM matching.search_chunks WHERE text LIKE '%${SECRET}%' OR title LIKE '%${SECRET}%'`))
  const ownerSees = JSON.stringify((await api(`/api/v1/my/intakes/${H1}`, {}, OWNER)).body).includes(SECRET)
  const leaked = JSON.stringify(R).includes(SECRET)
  check('8. đoạn mức 3 KHÔNG vào bản chiếu, KHÔNG có trong đoạn trích trả về; chủ sở hữu vẫn đọc được', inIdx === 0 && !leaked && ownerSees, `trong chỉ mục: ${inIdx}; rò trong kết quả: ${leaked}; chủ thấy: ${ownerSees}`)

  console.log('engine:', psql('SELECT engine_version FROM matching.search_query_logs ORDER BY created_at DESC LIMIT 1'))
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n════ TỔNG: ${results.length - failed}/${results.length} đạt ════`)
  process.exit(failed ? 1 : 0)
}
main().catch((e) => { console.error('LỖI KỊCH BẢN:', e); process.exit(2) })
