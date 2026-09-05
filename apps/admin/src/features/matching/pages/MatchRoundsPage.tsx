import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AlertTriangle, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { getErrorMessage, normalizeError } from '@/lib/api/client'
import {
  ENGINE_LABELS,
  SCORING_MODE_LABELS,
  SUBJECT_KIND_PATHS,
  formatRawScore,
  getLatestRound,
  isImportedRound,
  listCandidates,
} from '@/services/matchRoundService'
import type { CandidatePage, MatchRound, SubjectKindPath } from '@/services/matchRoundService'
import { RoundsHistory } from '../components/RoundsHistory'

const KIND_PATHS = SUBJECT_KIND_PATHS.map((k) => k.path)

function isKindPath(value: string | undefined): value is SubjectKindPath {
  return KIND_PATHS.includes(value as SubjectKindPath)
}

/**
 * Vòng ghép cặp của một subject (`moi/vong-ghep-cap.md`), phần API đã có: vòng **mới nhất** và ứng viên của nó.
 *
 * Subject nằm trong đường dẫn (`/match-rounds/:kind/:id`) — đó là "bộ lọc" duy nhất có nghĩa với bề mặt hiện
 * tại, và một liên kết tới đúng vòng của đúng bản ghi là thứ người ta gửi cho nhau. Bộ lọc theo chế độ chấm
 * điểm và theo phiên bản công cụ của đặc tả cần đường **liệt kê** các vòng, thứ chưa có ở máy chủ; trang này
 * không giả vờ có.
 *
 * Không focus gì. Đây là trang đọc.
 */
export function MatchRoundsPage() {
  const params = useParams<{ kind?: string; id?: string }>()
  const navigate = useNavigate()
  const kind = isKindPath(params.kind) ? params.kind : null
  const id = params.id ?? ''

  const [pickKind, setPickKind] = useState<SubjectKindPath>(kind ?? 'demand-briefs')
  const [pickId, setPickId] = useState(id)

  const submitPick = (e: React.FormEvent) => {
    e.preventDefault()
    if (pickId.trim()) navigate(`/match-rounds/${pickKind}/${pickId.trim()}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Vòng ghép cặp</h1>
        <p className="text-sm text-gray-600 mt-1">
          Vòng mới nhất của một bản ghi, kèm bốn thông tin mà phiên bản cũ giấu: công cụ, mô hình nhúng, chế độ chấm điểm, số ứng viên.
        </p>
      </div>

      <form onSubmit={submitPick} aria-label="Chọn bản ghi" className="p-4 rounded-lg border border-gray-200 bg-white grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3 items-end">
        <div>
          <label htmlFor="mr-kind" className="block text-sm font-medium text-gray-700 mb-1">Loại bản ghi</label>
          <select
            id="mr-kind"
            value={pickKind}
            onChange={(e) => setPickKind(e.target.value as SubjectKindPath)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {SUBJECT_KIND_PATHS.map((k) => <option key={k.path} value={k.path}>{k.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="mr-id" className="block text-sm font-medium text-gray-700 mb-1">Định danh bản ghi</label>
          <input
            id="mr-id"
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            placeholder="Dán định danh"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90">Xem vòng</button>
      </form>

      {kind && id ? (
        <>
          <RoundView kind={kind} id={id} />
          <RoundsHistory kind={kind} id={id} />
        </>
      ) : (
        <p className="text-sm text-gray-600">Chọn một bản ghi để xem vòng ghép cặp mới nhất của nó, và các vòng đã tính trước đó.</p>
      )}

      <p className="text-xs text-gray-500">
        <Link to="/audit-log" className="underline">Nhật ký kiểm toán</Link> ghi lại lượt đọc này.
      </p>
    </div>
  )
}

function RoundView({ kind, id }: { kind: SubjectKindPath; id: string }) {
  const [state, setState] = useState<'loading' | 'never-computed' | 'ready' | 'not-found' | 'error'>('loading')
  const [round, setRound] = useState<MatchRound | null>(null)
  const [candidates, setCandidates] = useState<CandidatePage | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    setState('loading')
    setError(null)
    setCandidates(null)
    ;(async () => {
      try {
        const r = await getLatestRound(kind, id)
        if (cancelled) return
        if (r === null) {
          setRound(null)
          setState('never-computed')
          return
        }
        setRound(r)
        setCandidates(await listCandidates(kind, id, page))
        if (!cancelled) setState('ready')
      } catch (err) {
        if (cancelled) return
        const n = normalizeError(err)
        if (n.status === 404) setState('not-found')
        else {
          setError(getErrorMessage(err))
          setState('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [kind, id, page])

  if (state === 'loading') return <p className="text-sm text-gray-600">Đang tải vòng…</p>

  if (state === 'not-found') {
    return (
      <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
        Không có bản ghi nào với định danh này, hoặc bạn không có quyền đọc nó. Một vòng ghép cặp chỉ tồn tại vì bản ghi của nó tồn tại.
      </p>
    )
  }

  if (state === 'error') {
    return <p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>
  }

  if (state === 'never-computed') {
    /*
      Ba nghĩa của "rỗng" theo đặc tả. Máy chủ phân biệt được nghĩa thứ nhất (204: chưa tính bao giờ) với "đã
      tính, 0 ứng viên" (200, candidateCount = 0). Nghĩa thứ ba (không có nội dung để tính) không suy được từ
      dữ liệu vòng — nói thẳng là không biết, thay vì đoán.
    */
    return (
      <div className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700 space-y-2">
        <p className="font-medium text-gray-900">Bản ghi này chưa từng được tính ghép cặp.</p>
        <p>
          Thường vì nó chưa xuất bản, chủ sở hữu tắt tự động ghép cặp, hoặc nó không có phần mô tả để nhúng. Dữ liệu
          vòng không phân biệt được ba lý do đó — kiểm tra ở bản ghi.
        </p>
      </div>
    )
  }

  if (!round) return null
  const imported = isImportedRound(round)

  return (
    <div className="space-y-4">
      {imported && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Vòng nhập từ hệ cũ.</strong> Đây không phải một lần tính: điểm được chép nguyên từ bảng ghép cặp của
            hệ NestJS, không chuẩn hoá, không có câu truy vấn để dựng lại. Không so nó với một vòng đã tính trên nền tảng mới.
          </p>
        </div>
      )}

      <p className="text-sm text-gray-700">
        Vòng đang dùng · <Link to={`/match-rounds/rounds/${round.id}`} className="underline">mở chi tiết</Link>
      </p>
      <section aria-label="Siêu dữ liệu vòng" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Meta label="Thời điểm" value={new Date(round.createdAt).toLocaleString('vi-VN')} />
        <Meta label="Chế độ chấm điểm" value={SCORING_MODE_LABELS[round.scoringMode] ?? round.scoringMode} hint={round.scoringMode} />
        <Meta label="Công cụ tìm kiếm" value={ENGINE_LABELS[round.searchEngineVersion] ?? round.searchEngineVersion} hint={round.searchEngineVersion} warn={imported} />
        <Meta label="Mô hình nhúng" value={round.embeddingModelVersion} mono />
        <Meta label="Số ứng viên" value={String(round.candidateCount)} />
      </section>

      {round.candidateCount === 0 && (
        <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
          <strong>Đã tính và không tìm thấy ứng viên nào.</strong> Khác với &ldquo;chưa tính&rdquo;: lần tính này có thật, kết quả là rỗng.
        </p>
      )}

      {round.scoringMode === 'LEGACY_SCORING' && !imported && (
        <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-900">
          <Info className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Chế độ cũ lọc cứng <em>sau</em> khi cắt top-K: bản nháp và bản ghi của chính chủ sở hữu chiếm chỗ trong top-K rồi bị
            loại, không có gì lấy bù. Vòng này có thể ít ứng viên hơn hẳn một vòng chế độ đã sửa mà không phải vì dữ liệu nghèo hơn.
          </p>
        </div>
      )}

      {candidates && candidates.data.length > 0 && (
        <section aria-label="Ứng viên" className="space-y-2">
          <p className="text-xs text-gray-500">
            Điểm thô chỉ có nghĩa trong cùng chế độ chấm điểm. Không so điểm giữa hai chế độ; chỉ so thứ hạng và có mặt hay không.
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2">Hạng</th>
                  <th className="px-3 py-2">Bản ghi ứng viên</th>
                  <th className="px-3 py-2">Điểm thô</th>
                  <th className="px-3 py-2">Lý do</th>
                  <th className="px-3 py-2">Đoạn</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {candidates.data.map((c) => {
                  const open = expanded[c.id] ?? false
                  return (
                    <Fragment key={c.id}>
                      <tr className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium">{c.rank}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-gray-500">{c.candidate.kind}</span>
                          <br />
                          <span className="font-mono text-xs">{c.candidate.id}</span>
                        </td>
                        <td className="px-3 py-2 font-mono">{formatRawScore(c.rawScore, round.scoringMode)}</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.reason ?? '—'}</td>
                        <td className="px-3 py-2">{c.chunkIndex}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setExpanded({ ...expanded, [c.id]: !open })}
                            aria-expanded={open}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                          >
                            {open ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronRight className="w-3 h-3" aria-hidden="true" />}
                            Đoạn khớp
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-t border-gray-100 bg-gray-50">
                          <td colSpan={6} className="px-3 py-2 text-xs text-gray-700 whitespace-pre-wrap">{c.matchedChunk || '(trống)'}</td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          {candidates.totalPages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Trước</button>
              <span className="text-sm text-gray-600">Trang {page} / {candidates.totalPages}</span>
              <button disabled={page >= candidates.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Sau</button>
            </nav>
          )}
        </section>
      )}

    </div>
  )
}

function Meta({ label, value, hint, mono = false, warn = false }: { label: string; value: string; hint?: string; mono?: boolean; warn?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border bg-white ${warn ? 'border-amber-300' : 'border-gray-200'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm mt-0.5 ${mono ? 'font-mono' : 'font-medium'} ${warn ? 'text-amber-800' : 'text-gray-900'}`}>{value}</p>
      {hint && hint !== value && <p className="text-[10px] font-mono text-gray-400 mt-0.5 break-all">{hint}</p>}
    </div>
  )
}
