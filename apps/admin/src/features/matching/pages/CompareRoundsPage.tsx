import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AlertTriangle, ArrowLeft, Check, Minus } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/client'
import {
  ENGINE_LABELS,
  SCORING_MODE_LABELS,
  compareRounds,
  formatRawScore,
  getRound,
  listRoundCandidates,
  mergeCandidates,
} from '@/services/matchRoundService'
import type { Comparison, MatchRound, MergedCandidate } from '@/services/matchRoundService'
import { RoundMeta } from '../components/RoundMeta'

const KIND_TO_PATH: Record<string, string> = {
  DEMAND_BRIEF: 'demand-briefs',
  TECHNOLOGY_ASSET: 'technology-assets',
  COMMERCIALIZATION_CASE: 'commercialization-cases',
}

const VERDICT_TEXT: Record<Comparison['verdict'], string> = {
  data: 'Ba trục giống hệt nhau, nên khác biệt giữa hai vòng đến từ dữ liệu: nội dung đổi, bản ghi mới xuất bản, hoặc nhãn lĩnh vực đổi.',
  algorithm: 'Hai vòng khác nhau ở ít nhất một trục, nên khác biệt có phần đến từ thuật toán. Màn hình không tách được phần do dữ liệu với phần do thuật toán.',
  incomparable: 'Không kết luận được. Một bên là kết quả đo trên nền tảng mới, một bên là dữ liệu chép sang từ hệ cũ — hai bên không cùng loại.',
}

/**
 * Trang so sánh hai vòng (`moi/vong-ghep-cap.md`, "Cái màn hình so sánh phải nói"). Hai lời gọi song song, mỗi
 * vòng một lời gọi; dòng kết luận ở đầu trang tính từ **siêu dữ liệu**, không từ điểm. Phần sau là bảng hợp
 * nhất ứng viên; điểm thô hiện theo cột riêng và chỉ trừ cho nhau khi cùng chế độ.
 */
export function CompareRoundsPage() {
  const [params] = useSearchParams()
  const a = params.get('a') ?? ''
  const b = params.get('b') ?? ''
  const [rounds, setRounds] = useState<[MatchRound, MatchRound] | null>(null)
  const [rows, setRows] = useState<MergedCandidate[]>([])
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChunks, setShowChunks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!a || !b) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const [ra, rb, ca, cb] = await Promise.all([getRound(a), getRound(b), listRoundCandidates(a), listRoundCandidates(b)])
        if (cancelled) return
        const cmp = compareRounds(ra, rb)
        setRounds([ra, rb])
        setComparison(cmp)
        setRows(mergeCandidates(ca.data, cb.data, cmp))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [a, b])

  if (!a || !b) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">So sánh hai vòng</h1>
        <p className="text-sm text-gray-700">Cần hai định danh vòng (`?a=&b=`). Chọn hai vòng trong danh sách vòng của một bản ghi rồi bấm So sánh.</p>
        <Link to="/match-rounds" className="inline-flex items-center gap-1 text-sm text-brand hover:underline"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Vòng ghép cặp</Link>
      </div>
    )
  }
  if (loading) return <p className="p-6 text-sm text-gray-600">Đang tải hai vòng…</p>
  if (error || !rounds || !comparison) return <div className="p-6"><p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error ?? 'Không tải được.'}</p></div>

  const [ra, rb] = rounds
  const sameSubject = ra.subject.kind === rb.subject.kind && ra.subject.id === rb.subject.id
  const backPath = KIND_TO_PATH[ra.subject.kind] ? `/match-rounds/${KIND_TO_PATH[ra.subject.kind]}/${ra.subject.id}` : '/match-rounds'
  const label = (key: string, v: string) => key === 'scoringMode' ? SCORING_MODE_LABELS[v] ?? v : key === 'searchEngineVersion' ? ENGINE_LABELS[v] ?? v : v

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to={backPath} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Các vòng đã tính</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">So sánh hai vòng</h1>
        <p className="text-sm text-gray-600 mt-1">
          A = <Link to={`/match-rounds/rounds/${ra.id}`} className="font-mono underline">{ra.id.slice(0, 8)}…</Link> ({new Date(ra.createdAt).toLocaleString('vi-VN')}) ·
          B = <Link to={`/match-rounds/rounds/${rb.id}`} className="font-mono underline">{rb.id.slice(0, 8)}…</Link> ({new Date(rb.createdAt).toLocaleString('vi-VN')})
        </p>
      </div>

      {!sameSubject && (
        <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">Hai vòng thuộc hai bản ghi khác nhau. Bảng dưới vẫn hợp nhất được, nhưng &ldquo;cùng ứng viên rơi hạng&rdquo; không có nghĩa ở đây.</p>
      )}

      {/* Phần đầu — quan trọng hơn phần sau. */}
      <section aria-label="Kết luận" className={`p-4 rounded-lg border text-sm ${comparison.verdict === 'incomparable' ? 'bg-amber-50 border-amber-300 text-amber-900' : comparison.verdict === 'data' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
        <p className="font-medium flex items-start gap-2">
          {comparison.verdict === 'incomparable' && <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />}
          {VERDICT_TEXT[comparison.verdict]}
        </p>
        <table className="mt-3 w-full text-xs">
          <thead><tr className="text-left"><th className="py-1">Trục</th><th className="py-1">A</th><th className="py-1">B</th><th className="py-1"></th></tr></thead>
          <tbody>
            {comparison.axes.map((x) => (
              <tr key={x.key} className="border-t border-black/5">
                <td className="py-1 pr-3">{x.label}</td>
                <td className="py-1 pr-3">{label(x.key, x.a)}</td>
                <td className="py-1 pr-3">{label(x.key, x.b)}</td>
                <td className="py-1">{x.same ? <span className="inline-flex items-center gap-1"><Check className="w-3 h-3" aria-hidden="true" /> giống</span> : <span className="inline-flex items-center gap-1 font-semibold"><Minus className="w-3 h-3" aria-hidden="true" /> khác</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2"><p className="text-sm font-semibold text-gray-900">Vòng A</p><RoundMeta round={ra} compact /></div>
        <div className="space-y-2"><p className="text-sm font-semibold text-gray-900">Vòng B</p><RoundMeta round={rb} compact /></div>
      </div>

      {ra.scoringMode === 'LEGACY_SCORING' && rb.scoringMode === 'CORRECTED_SCORING' && (
        <p className="text-sm text-gray-700 p-3 rounded-lg border border-gray-200 bg-white">
          A là chế độ cũ: lọc cứng chạy <em>sau</em> khi cắt top-K, nên các ô bị bản nháp và bản ghi của chính chủ sở hữu chiếm chỗ rồi bị loại, không được lấy bù. A ít ứng viên hơn B không có nghĩa là dữ liệu đã giàu lên.
        </p>
      )}

      {/* Phần sau — hợp nhất hai danh sách. */}
      <section aria-label="Ứng viên hợp nhất" className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Ứng viên ở hai vòng</h2>
        <p className="text-xs text-gray-500">
          {comparison.scoresComparable
            ? 'Hai vòng cùng chế độ: hiệu số điểm (B − A) có nghĩa.'
            : 'Điểm thô hiện theo từng cột và không trừ cho nhau — hai chế độ không cùng đơn vị. Chỉ so thứ hạng và có mặt hay không.'}
        </p>
        {rows.length === 0 ? (
          <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">Cả hai vòng đều không có ứng viên.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2">Bản ghi</th>
                  <th className="px-3 py-2">Hạng A</th>
                  <th className="px-3 py-2">Hạng B</th>
                  <th className="px-3 py-2">Có ở</th>
                  <th className="px-3 py-2">Điểm A</th>
                  <th className="px-3 py-2">Điểm B</th>
                  {comparison.scoresComparable && <th className="px-3 py-2">B − A</th>}
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const open = showChunks[r.key] ?? false
                  return [
                    <tr key={r.key} className="border-t border-gray-100">
                      <td className="px-3 py-2"><span className="text-xs text-gray-500">{r.candidate.kind}</span><br /><span className="font-mono text-xs">{r.candidate.id}</span></td>
                      <td className="px-3 py-2 font-medium">{r.rankA ?? '—'}</td>
                      <td className="px-3 py-2 font-medium">{r.rankB ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${r.presence === 'both' ? 'bg-gray-100 text-gray-800' : r.presence === 'a-only' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'}`}>
                          {r.presence === 'both' ? 'cả hai' : r.presence === 'a-only' ? 'chỉ A' : 'chỉ B'}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono">{r.scoreA === null ? '—' : formatRawScore(r.scoreA, ra.scoringMode)}</td>
                      <td className="px-3 py-2 font-mono">{r.scoreB === null ? '—' : formatRawScore(r.scoreB, rb.scoringMode)}</td>
                      {comparison.scoresComparable && <td className="px-3 py-2 font-mono">{r.scoreDelta === null ? '—' : (r.scoreDelta >= 0 ? '+' : '') + formatRawScore(r.scoreDelta, ra.scoringMode)}</td>}
                      <td className="px-3 py-2"><button type="button" onClick={() => setShowChunks({ ...showChunks, [r.key]: !open })} aria-expanded={open} className="text-xs underline">Đoạn khớp</button></td>
                    </tr>,
                    open ? (
                      <tr key={`${r.key}-chunks`} className="border-t border-gray-100 bg-gray-50">
                        <td colSpan={comparison.scoresComparable ? 8 : 7} className="px-3 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                            <div><p className="font-semibold mb-1">A</p><p className="whitespace-pre-wrap">{r.chunkA ?? '— không có ở A'}</p></div>
                            <div><p className="font-semibold mb-1">B</p><p className="whitespace-pre-wrap">{r.chunkB ?? '— không có ở B'}</p></div>
                          </div>
                        </td>
                      </tr>
                    ) : null,
                  ]
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
