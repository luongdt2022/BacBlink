import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { getErrorMessage, normalizeError } from '@/lib/api/client'
import { SUBJECT_KIND_PATHS, formatRawScore, getRound, isImportedRound, listRoundCandidates, listRoundExclusions } from '@/services/matchRoundService'
import type { CandidatePage, ExclusionPage, MatchRound } from '@/services/matchRoundService'
import { ImportedBanner, RoundMeta } from '../components/RoundMeta'
import { ExclusionsTable, ReasonCodes } from '../components/Reasons'

const KIND_TO_PATH: Record<string, string> = {
  DEMAND_BRIEF: 'demand-briefs',
  TECHNOLOGY_ASSET: 'technology-assets',
  COMMERCIALIZATION_CASE: 'commercialization-cases',
}

/**
 * Chi tiết một vòng: phần đầu là siêu dữ liệu, phần thân là ứng viên theo hạng tăng dần — bản ghi nào, hạng,
 * điểm thô, lý do, chỉ số đoạn, và đoạn khớp thu gọn mặc định. Không focus gì; trang đọc.
 */
export function RoundDetailPage() {
  const { roundId = '' } = useParams<{ roundId: string }>()
  const [round, setRound] = useState<MatchRound | null>(null)
  const [candidates, setCandidates] = useState<CandidatePage | null>(null)
  const [exclusions, setExclusions] = useState<ExclusionPage | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        const [r, c, x] = await Promise.all([
          getRound(roundId),
          listRoundCandidates(roundId, page, 20),
          // Danh sách loại không phân trang cùng danh sách chọn: nó là bối cảnh của cả vòng, không phải trang
          // thứ n của cái gì. Trần của máy chủ là 100 và số ứng viên bị loại trong một vòng luôn nhỏ hơn thế.
          listRoundExclusions(roundId, 1, 100),
        ])
        if (cancelled) return
        setRound(r)
        setCandidates(c)
        setExclusions(x)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        if (normalizeError(err).status === 404) setStatus('not-found')
        else {
          setError(getErrorMessage(err))
          setStatus('error')
        }
      }
    })()
    return () => { cancelled = true }
  }, [roundId, page])

  if (status === 'loading') return <p className="p-6 text-sm text-gray-600">Đang tải vòng…</p>
  if (status === 'not-found') {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-gray-700">Không có vòng nào với định danh này, hoặc bạn không có quyền đọc bản ghi mà nó thuộc về.</p>
        <Link to="/match-rounds" className="inline-flex items-center gap-1 text-sm text-brand hover:underline"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Vòng ghép cặp</Link>
      </div>
    )
  }
  if (status === 'error' || !round) return <div className="p-6"><p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p></div>

  const kindPath = KIND_TO_PATH[round.subject.kind]
  const kindLabel = SUBJECT_KIND_PATHS.find((k) => k.path === kindPath)?.label ?? round.subject.kind
  const imported = isImportedRound(round)

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to={kindPath ? `/match-rounds/${kindPath}/${round.subject.id}` : '/match-rounds'} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {kindLabel} <span className="font-mono text-xs">{round.subject.id.slice(0, 8)}…</span>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Vòng ghép cặp <span className="font-mono text-base text-gray-500">{round.id.slice(0, 8)}…</span></h1>
        {round.isAuthoritative && <p className="text-sm text-green-800 mt-1">Đây là vòng đang dùng cho bản ghi.</p>}
      </div>

      {imported && <ImportedBanner />}
      <RoundMeta round={round} />

      <section aria-label="Câu truy vấn" className="p-3 rounded-lg border border-gray-200 bg-white text-sm">
        <p className="text-xs text-gray-500">Đã tìm bằng gì</p>
        {round.queryText ? <p className="mt-1 whitespace-pre-wrap text-gray-800">{round.queryText}</p> : <p className="mt-1 text-gray-600">Vòng này không có câu truy vấn — không dựng lại được nó đã hỏi gì.</p>}
      </section>

      {/*
        Hai câu khác nhau, và phân biệt được chúng là lý do bảng loại tồn tại: *không tìm thấy gì* nghĩa là
        không thu hồi được ứng viên nào; *tìm thấy rồi loại hết* nghĩa là hệ thống đã xem qua một loạt bản ghi
        và bỏ hết. Trước 2026-09-06 người dùng chỉ thấy câu thứ nhất cho cả hai trường hợp.
      */}
      {candidates && candidates.data.length === 0 && (
        <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
          {exclusions && exclusions.data.length > 0 ? (
            <>
              <strong>Đã tìm thấy {exclusions.total} ứng viên và loại hết.</strong> Bảng bên dưới nói vì sao từng
              bản ghi bị loại — đây không phải {'“'}không có gì phù hợp{'”'}.
            </>
          ) : (
            <strong>Đã tính và không tìm thấy ứng viên nào.</strong>
          )}
        </p>
      )}

      {candidates && candidates.data.length > 0 && (
        <section aria-label="Ứng viên" className="space-y-2">
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
                  return [
                    <tr key={c.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{c.rank}</td>
                      <td className="px-3 py-2"><span className="text-xs text-gray-500">{c.candidate.kind}</span><br /><span className="font-mono text-xs">{c.candidate.id}</span></td>
                      <td className="px-3 py-2 font-mono">{formatRawScore(c.rawScore, round.scoringMode)}</td>
                      <td className="px-3 py-2"><ReasonCodes codes={c.reasonCodes} algorithm={c.reason} /></td>
                      <td className="px-3 py-2">{c.chunkIndex}</td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => setExpanded({ ...expanded, [c.id]: !open })} aria-expanded={open} className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline">
                          {open ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronRight className="w-3 h-3" aria-hidden="true" />} Đoạn khớp
                        </button>
                      </td>
                    </tr>,
                    open ? (
                      <tr key={`${c.id}-chunk`} className="border-t border-gray-100 bg-gray-50">
                        <td colSpan={6} className="px-3 py-2 text-xs text-gray-700 whitespace-pre-wrap">{c.matchedChunk || '(trống)'}</td>
                      </tr>
                    ) : null,
                  ]
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

      {exclusions && (
        <section aria-label="Ứng viên bị loại" className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Đã loại ({exclusions.total})</h2>
            <p className="text-sm text-gray-600">
              Ai <strong>không</strong> vào danh sách, và vì sao. Xếp theo điểm giảm dần: người trượt sát ngưỡng
              nhất đứng đầu, vì đó là chỗ quyết định dễ sai nhất.
            </p>
          </div>
          <ExclusionsTable exclusions={exclusions.data} scoringMode={round.scoringMode} />
        </section>
      )}
    </div>
  )
}
