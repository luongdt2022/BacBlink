import { Link } from 'react-router'
import { ArrowRight, PenLine } from 'lucide-react'
import { DECISION_LABELS, STAGE_LABELS, isBackward } from '@/services/caseService'
import type { DecisionRecord } from '@/services/caseService'

/**
 * Dòng thời gian, sắp theo thời điểm quyết định **tăng dần**. Hai loại mục và chúng trông khác nhau:
 * chuyển giai đoạn (`A → B`, vẽ như bước tiến hoặc lùi) và gỡ khoá (giai đoạn không đổi, vẽ như một ghi chú
 * có người ký — không phải một mũi tên vòng).
 *
 * Ba điều dữ liệu thô không tự nói: không có gì bị xoá (quyết định thay thế trỏ về bản cũ, cả hai còn); ai
 * quyết là **mã ẩn danh**, không phải tên; ảnh chụp chính sách gắn với **từng** quyết định.
 */
export function CaseTimeline({ records }: { records: DecisionRecord[] }) {
  const ordered = [...records].sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
  if (ordered.length === 0) {
    return <p className="text-sm text-gray-600">Chưa có quyết định nào. Hồ sơ vẫn ở giai đoạn ban đầu.</p>
  }
  const byId = new Map(ordered.map((r) => [r.id, r]))

  return (
    <ol className="space-y-3" aria-label="Dòng thời gian">
      {ordered.map((r) => {
        const isHoldRelease = r.fromStage === r.toStage
        const backward = !isHoldRelease && isBackward(r.fromStage, r.toStage)
        const superseded = r.supersedesId ? byId.get(r.supersedesId) : undefined
        return (
          <li
            key={r.id}
            className={`p-4 rounded-lg border ${isHoldRelease ? 'border-dashed border-gray-300 bg-gray-50' : backward ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {isHoldRelease ? (
                <span className="inline-flex items-center gap-1 text-gray-700">
                  <PenLine className="w-4 h-4" aria-hidden="true" />
                  Gỡ khoá — giai đoạn giữ nguyên <strong>{STAGE_LABELS[r.fromStage] ?? r.fromStage}</strong>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                  {STAGE_LABELS[r.fromStage] ?? r.fromStage}
                  <ArrowRight className={`w-4 h-4 ${backward ? 'rotate-180 text-amber-700' : ''}`} aria-hidden="true" />
                  {STAGE_LABELS[r.toStage] ?? r.toStage}
                  {backward && <span className="text-xs text-amber-800 ml-1">(trả về làm lại)</span>}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono">{DECISION_LABELS[r.decision] ?? r.decision}</span>
              <span className="text-xs text-gray-500 ml-auto">{new Date(r.decidedAt).toLocaleString('vi-VN')}</span>
            </div>
            <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{r.rationale}</p>
            <dl className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
              <div><dt className="inline">Mã lý do: </dt><dd className="inline font-mono">{r.reasonCodes.length ? r.reasonCodes.join(', ') : '—'}</dd></div>
              <div><dt className="inline">Người quyết (mã): </dt><dd className="inline font-mono">{r.decidedByActorRef}</dd></div>
              <div><dt className="inline">Uỷ quyền: </dt><dd className="inline font-mono">{r.mandateRef ?? '—'}</dd></div>
              <div>
                <dt className="inline">Ảnh chụp chính sách: </dt>
                <dd className="inline">
                  {r.policySnapshotId ? (
                    <Link to={`/policy-snapshots/${r.policySnapshotId}`} className="font-mono underline">{r.policySnapshotId.slice(0, 8)}…</Link>
                  ) : (
                    /* Rỗng theo thiết kế: mọi quyết định trước thẩm định không mang ảnh chụp. Không phải ô trống. */
                    <span>quyết định này ra trước khi chính sách được chốt</span>
                  )}
                </dd>
              </div>
              {r.supersedesId && (
                <div className="md:col-span-2">
                  <dt className="inline">Thay thế: </dt>
                  <dd className="inline">
                    quyết định <span className="font-mono">{r.supersedesId.slice(0, 8)}…</span>
                    {superseded && <> ({STAGE_LABELS[superseded.fromStage]} → {STAGE_LABELS[superseded.toStage]}, {new Date(superseded.decidedAt).toLocaleString('vi-VN')})</>}
                    {' '}— bản cũ vẫn còn ở trên, không bị xoá.
                  </dd>
                </div>
              )}
            </dl>
          </li>
        )
      })}
    </ol>
  )
}
