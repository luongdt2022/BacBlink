import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { GitCompare } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/client'
import {
  ENGINE_LABELS,
  ENGINE_OPTIONS,
  SCORING_MODE_LABELS,
  isImportedRound,
  listRounds,
} from '@/services/matchRoundService'
import type { MatchRound, Page, SubjectKindPath } from '@/services/matchRoundService'

/**
 * Danh sách các vòng đã tính cho một subject (`moi/vong-ghep-cap.md`, "Vào màn"): mỗi dòng đủ **năm thứ** để
 * chọn được hai vòng đáng so — thời điểm, chế độ, công cụ, mô hình nhúng, số ứng viên. Hai bộ lọc (chế độ,
 * công cụ) nằm trong URL. Không lọc theo điểm.
 *
 * Chọn đúng hai vòng rồi bấm So sánh → `/match-rounds/compare?a=&b=`. Không giới hạn ở vòng cùng chế độ —
 * trang so sánh sẽ nói khi phép so không công bằng, thay vì chặn trước một câu hỏi hợp lệ.
 */
export function RoundsHistory({ kind, id }: { kind: SubjectKindPath; id: string }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const filters = useMemo(() => ({
    scoringMode: params.get('scoringMode') ?? '',
    searchEngineVersion: params.get('searchEngineVersion') ?? '',
    page: Number(params.get('page')) || 1,
  }), [params])
  const [page, setPage] = useState<Page<MatchRound> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    setError(null)
    listRounds(kind, id, filters)
      .then((p) => { if (!cancelled) setPage(p) })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err)) })
    return () => { cancelled = true }
  }, [kind, id, filters])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next, { replace: false })
  }

  const toggle = (roundId: string) => {
    setSelected((cur) => cur.includes(roundId) ? cur.filter((x) => x !== roundId) : cur.length >= 2 ? [cur[1], roundId] : [...cur, roundId])
  }

  return (
    <section aria-label="Các vòng đã tính" className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <h2 className="text-lg font-semibold text-gray-900 mr-auto">Các vòng đã tính</h2>
        <div>
          <label htmlFor="rh-mode" className="block text-xs font-medium text-gray-700 mb-1">Chế độ chấm điểm</label>
          <select id="rh-mode" value={filters.scoringMode} onChange={(e) => setFilter('scoringMode', e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Tất cả</option>
            {Object.entries(SCORING_MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rh-engine" className="block text-xs font-medium text-gray-700 mb-1">Phiên bản công cụ</label>
          <select id="rh-engine" value={filters.searchEngineVersion} onChange={(e) => setFilter('searchEngineVersion', e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Tất cả</option>
            {ENGINE_OPTIONS.map((k) => <option key={k} value={k}>{ENGINE_LABELS[k]}</option>)}
          </select>
        </div>
        <button
          type="button"
          disabled={selected.length !== 2}
          onClick={() => navigate(`/match-rounds/compare?a=${selected[0]}&b=${selected[1]}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitCompare className="w-4 h-4" aria-hidden="true" /> So sánh hai vòng đã chọn
        </button>
      </div>

      {error && <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>}

      {page && page.data.length === 0 && (
        <p className="p-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
          {filters.scoringMode || filters.searchEngineVersion ? 'Không có vòng nào khớp bộ lọc.' : 'Chưa có vòng nào được tính cho bản ghi này.'}
        </p>
      )}

      {page && page.data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2"><span className="sr-only">Chọn để so sánh</span></th>
                <th className="px-3 py-2">Thời điểm</th>
                <th className="px-3 py-2">Chế độ chấm điểm</th>
                <th className="px-3 py-2">Công cụ</th>
                <th className="px-3 py-2">Mô hình nhúng</th>
                <th className="px-3 py-2">Ứng viên</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {page.data.map((r) => {
                const imported = isImportedRound(r)
                return (
                  <tr key={r.id} className={`border-t border-gray-100 ${imported ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-3 py-2">
                      <input type="checkbox" aria-label={`Chọn vòng ${r.id}`} checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString('vi-VN')}
                      {r.isAuthoritative && <span className="ml-2 px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-medium">đang dùng</span>}
                    </td>
                    <td className="px-3 py-2">{SCORING_MODE_LABELS[r.scoringMode] ?? r.scoringMode}</td>
                    <td className={`px-3 py-2 ${imported ? 'text-amber-800 font-medium' : ''}`}>{ENGINE_LABELS[r.searchEngineVersion] ?? r.searchEngineVersion}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.embeddingModelVersion}</td>
                    <td className="px-3 py-2">{r.candidateCount}</td>
                    <td className="px-3 py-2"><Link to={`/match-rounds/rounds/${r.id}`} className="text-xs underline">Chi tiết</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {page && page.totalPages > 1 && (
        <nav aria-label="Phân trang vòng" className="flex items-center gap-3">
          <button disabled={filters.page <= 1} onClick={() => setFilter('page', String(filters.page - 1))} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Trước</button>
          <span className="text-sm text-gray-600">Trang {filters.page} / {page.totalPages}</span>
          <button disabled={filters.page >= page.totalPages} onClick={() => setFilter('page', String(filters.page + 1))} className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50">Sau</button>
        </nav>
      )}
    </section>
  )
}
