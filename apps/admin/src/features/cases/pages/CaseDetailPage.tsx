import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, FileText, Shuffle, UserPlus } from 'lucide-react'
import { ROLE_LABELS, STAGE_LABELS, TRACK_LABELS, isTerminal } from '@/services/caseService'
import type { CaseStage } from '@/services/caseService'
import { useCaseDetail } from '../hooks/useCaseDetail'
import { StageBar } from '../components/StageBar'
import { DecisionDialog } from '../components/DecisionDialog'
import { HoldPanel } from '../components/HoldPanel'
import { CaseTimeline } from '../components/CaseTimeline'

/**
 * Console một hồ sơ (`moi/console-ho-so-vu-viec.md`). Ba thứ hiện ngay ở phần đầu, không giấu sau tab: giai
 * đoạn hiện tại (và "đã đóng" nếu kết thúc), cờ khoá tạm, phiên bản đề bài đang ghim. Không focus gì — trang đọc.
 */
export function CaseDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { caseRecord, timeline, demand, status, error, transition, openHold, releaseHold, assignBroker } = useCaseDetail(id)
  const [target, setTarget] = useState<CaseStage | null>(null)
  const [releaseRequested, setReleaseRequested] = useState(false)
  const [brokerInput, setBrokerInput] = useState<string | null>(null)
  const [brokerError, setBrokerError] = useState<string | null>(null)

  if (status === 'loading') return <p className="p-6 text-sm text-gray-600">Đang tải hồ sơ…</p>
  if (status === 'not-found') {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-gray-700">Không có hồ sơ nào với định danh này, hoặc bạn không phải bên tham gia của nó.</p>
        <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-brand hover:underline"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Về danh sách</Link>
      </div>
    )
  }
  if (status === 'error' || !caseRecord) {
    return <div className="p-6"><p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p></div>
  }

  const c = caseRecord
  const closed = isTerminal(c.stage)
  const activeParties = c.parties.filter((p) => !p.until)

  const submitBroker = async () => {
    if (!brokerInput?.trim()) return
    setBrokerError(null)
    const err = await assignBroker(brokerInput.trim())
    if (err) setBrokerError(err)
    else setBrokerInput(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Hồ sơ vụ việc</Link>
        <div className="flex flex-wrap items-baseline gap-3 mt-2">
          <h1 className="text-2xl font-semibold text-gray-900">{c.title}</h1>
          <span className="font-mono text-sm text-gray-500">{c.caseCode}</span>
          <span className="text-xs text-gray-500">phiên bản {c.version}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{TRACK_LABELS[c.track] ?? c.track} · {c.confidentialityLevel}</p>
      </div>

      {/* Ba thứ phải hiện ngay: giai đoạn (+ đã đóng), cờ khoá, phiên bản đề bài ghim. */}
      <section aria-label="Phần đầu" className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-gray-200 bg-white">
          <p className="text-xs text-gray-500">Giai đoạn hiện tại</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{STAGE_LABELS[c.stage] ?? c.stage}</p>
          {closed && <p className="text-xs text-gray-600 mt-1">Hồ sơ đã đóng; không đi đâu được nữa.</p>}
        </div>
        <div className={`p-3 rounded-lg border bg-white ${c.hasOpenHold ? 'border-amber-300' : 'border-gray-200'}`}>
          <p className="text-xs text-gray-500">Khoá tạm</p>
          <p className={`text-sm font-medium mt-0.5 ${c.hasOpenHold ? 'text-amber-800' : 'text-gray-900'}`}>{c.hasOpenHold ? 'Đang bị khoá — chặn mọi lệnh chuyển' : 'Không'}</p>
        </div>
        <div className={`p-3 rounded-lg border bg-white ${demand && demand.currentVersionNo > c.demandBriefVersionNo ? 'border-amber-300' : 'border-gray-200'}`}>
          <p className="text-xs text-gray-500">Đề bài đang ghim</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">
            <Link to={`/challenges/detail?id=${c.demandBriefId}`} className="underline">phiên bản {c.demandBriefVersionNo}</Link>
          </p>
          {/*
            Chỗ dễ hiểu nhầm nhất trong hệ thống: hai người mở cùng một đề bài từ hai chỗ khác nhau có thể đọc
            hai nội dung khác nhau. Ba trạng thái, ba câu: đề bài có bản mới hơn (cảnh báo); vẫn là bản mới nhất;
            không đọc được đề bài (quyền đọc đề bài khác quyền đọc hồ sơ) — nói "không so được", không im lặng.
          */}
          {demand === undefined && <p className="text-xs text-gray-500 mt-1">Đang so với đề bài…</p>}
          {demand === null && <p className="text-xs text-gray-600 mt-1">Không đọc được đề bài để so — bạn có thể không có quyền đọc nó, dù đọc được hồ sơ.</p>}
          {demand && demand.currentVersionNo > c.demandBriefVersionNo && (
            <p className="text-xs text-amber-800 mt-1" role="status">
              <strong>Đề bài đã có phiên bản {demand.currentVersionNo}.</strong> Hồ sơ vẫn đọc phiên bản {c.demandBriefVersionNo}; hai người mở đề bài từ hai chỗ có thể thấy hai nội dung khác nhau.
            </p>
          )}
          {demand && demand.currentVersionNo <= c.demandBriefVersionNo && (
            <p className="text-xs text-gray-600 mt-1">Đây vẫn là phiên bản mới nhất của đề bài.</p>
          )}
        </div>
      </section>

      <section aria-label="Chính sách" className="text-sm text-gray-700 inline-flex items-center gap-2">
        <FileText className="w-4 h-4" aria-hidden="true" />
        {c.policySnapshotId ? (
          <Link to={`/policy-snapshots/${c.policySnapshotId}`} className="underline">Ảnh chụp chính sách đang áp</Link>
        ) : (
          /* Trạng thái thường của mọi hồ sơ chưa vào thẩm định — nói khi nào chốt, không nói "không tìm thấy". */
          <span>Chính sách chưa chốt. Nó được chốt khi hồ sơ vào <strong>Thẩm định</strong>.</span>
        )}
        <span className="text-gray-300">·</span>
        <Shuffle className="w-4 h-4" aria-hidden="true" />
        <Link to={`/match-rounds/commercialization-cases/${c.id}`} className="underline">Vòng ghép cặp</Link>
      </section>

      <section aria-label="Thanh giai đoạn" className="p-4 rounded-lg border border-gray-200 bg-white">
        <StageBar stage={c.stage} hasOpenHold={c.hasOpenHold} onPick={setTarget} />
      </section>

      <HoldPanel
        holds={c.holds}
        hasOpenHold={c.hasOpenHold}
        closed={closed}
        onOpen={openHold}
        onRelease={releaseHold}
        releaseRequested={releaseRequested}
      />

      <section aria-label="Bên tham gia" className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Bên tham gia</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {activeParties.map((p) => (
            <li key={`${p.personId}-${p.role}`} className="px-2 py-1 rounded bg-gray-100">
              <span className="font-medium">{ROLE_LABELS[p.role] ?? p.role}</span> <span className="font-mono text-xs text-gray-600">{p.personId.slice(0, 8)}…</span>
            </li>
          ))}
        </ul>
        {!closed && brokerInput === null && (
          <button type="button" onClick={() => setBrokerInput('')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50">
            <UserPlus className="w-4 h-4" aria-hidden="true" /> {c.leadBrokerPersonId ? 'Đổi môi giới chính' : 'Gán môi giới chính'}
          </button>
        )}
        {brokerInput !== null && (
          <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-2 max-w-lg">
            <label htmlFor="broker-id" className="block text-sm font-medium text-gray-700">Mã người làm môi giới chính</label>
            <input id="broker-id" value={brokerInput} onChange={(e) => setBrokerInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" autoFocus />
            {brokerError && <p role="alert" className="text-sm text-red-700">{brokerError}</p>}
            <div className="flex gap-2">
              <button type="button" disabled={!brokerInput.trim()} onClick={() => void submitBroker()} className="px-3 py-1.5 rounded bg-brand text-white text-sm font-semibold disabled:opacity-50">Gán</button>
              <button type="button" onClick={() => { setBrokerInput(null); setBrokerError(null) }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">Huỷ</button>
            </div>
          </div>
        )}
      </section>

      <section aria-label="Dòng thời gian" className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Dòng thời gian</h2>
        <p className="text-xs text-gray-500">Chỉ ghi thêm. Không có gì bị xoá; người quyết là mã ẩn danh, không phải tên.</p>
        <CaseTimeline records={timeline} />
      </section>

      {target && (
        <DecisionDialog
          fromStage={c.stage}
          toStage={target}
          version={c.version}
          onSubmit={async (body) => {
            const result = await transition(body)
            if (result.ok) setTarget(null)
            return result
          }}
          onClose={() => setTarget(null)}
          onAssignBroker={() => { setTarget(null); setBrokerInput('') }}
          onReleaseHold={() => { setTarget(null); setReleaseRequested(true) }}
        />
      )}
    </div>
  )
}
