import { useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import type { CaseHold } from '@/services/caseService'

interface HoldPanelProps {
  holds: CaseHold[]
  hasOpenHold: boolean
  closed: boolean
  onOpen: (reason: string) => Promise<string | null>
  onRelease: (holdId: string, rationale: string) => Promise<string | null>
  /** Mở sẵn ô gỡ khoá — dùng khi hộp thoại quyết định chuyển sang đây vì `CASE_ON_HOLD`. */
  releaseRequested?: boolean
}

/**
 * Khoá tạm. Nút khoá nằm ở phần đầu và cần một lý do; từ lúc đó mọi nút chuyển giai đoạn tắt và một dải hiện
 * ở đầu trang. Gỡ khoá cần một diễn giải riêng và tạo một mục trong dòng thời gian.
 *
 * Nhiều khoá mở cùng lúc là được phép và hồ sơ bị chặn cho tới khi gỡ hết — nên đây là danh sách từng khoá
 * với nút gỡ từng cái, không phải một cờ.
 */
export function HoldPanel({ holds, hasOpenHold, closed, onOpen, onRelease, releaseRequested = false }: HoldPanelProps) {
  const [reason, setReason] = useState('')
  const [showOpen, setShowOpen] = useState(false)
  const [releasing, setReleasing] = useState<string | null>(releaseRequested ? holds.find((h) => !h.releasedAt)?.id ?? null : null)
  const [rationale, setRationale] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = holds.filter((h) => !h.releasedAt)

  const submitOpen = async () => {
    if (!reason.trim()) return
    setBusy(true)
    setError(null)
    const err = await onOpen(reason.trim())
    setBusy(false)
    if (err) setError(err)
    else {
      setReason('')
      setShowOpen(false)
    }
  }

  const submitRelease = async (holdId: string) => {
    if (!rationale.trim()) return
    setBusy(true)
    setError(null)
    const err = await onRelease(holdId, rationale.trim())
    setBusy(false)
    if (err) setError(err)
    else {
      setRationale('')
      setReleasing(null)
    }
  }

  return (
    <section aria-label="Khoá tạm" className="space-y-3">
      {hasOpenHold && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-900" role="status">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2 w-full">
            <p><strong>Hồ sơ đang bị khoá</strong> ({open.length} khoá mở). Mọi lệnh chuyển giai đoạn bị chặn cho tới khi gỡ hết.</p>
            <ul className="space-y-2">
              {open.map((h) => (
                <li key={h.id} className="p-2 rounded bg-white border border-amber-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-gray-900">{h.reason}</p>
                      <p className="text-xs text-gray-500">Mở lúc {new Date(h.openedAt).toLocaleString('vi-VN')}{h.openedByActorRef ? ` · bởi ${h.openedByActorRef.slice(0, 8)}…` : ''}</p>
                    </div>
                    {releasing !== h.id && (
                      <button type="button" onClick={() => setReleasing(h.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-400 text-xs font-medium hover:bg-amber-100">
                        <Unlock className="w-3 h-3" aria-hidden="true" /> Gỡ khoá
                      </button>
                    )}
                  </div>
                  {releasing === h.id && (
                    <div className="mt-2 space-y-2">
                      <label htmlFor={`rel-${h.id}`} className="block text-xs font-medium text-gray-700">Diễn giải gỡ khoá <span className="text-red-600">*</span></label>
                      <textarea id={`rel-${h.id}`} value={rationale} onChange={(e) => setRationale(e.target.value)} rows={2} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" autoFocus />
                      <div className="flex gap-2">
                        <button type="button" disabled={!rationale.trim() || busy} onClick={() => void submitRelease(h.id)} className="px-3 py-1 rounded bg-brand text-white text-xs font-semibold disabled:opacity-50">{busy ? 'Đang gỡ…' : 'Xác nhận gỡ'}</button>
                        <button type="button" onClick={() => { setReleasing(null); setRationale('') }} className="px-3 py-1 rounded border border-gray-300 text-xs">Huỷ</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!closed && !showOpen && (
        <button type="button" onClick={() => setShowOpen(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-gray-50">
          <Lock className="w-4 h-4" aria-hidden="true" /> Khoá hồ sơ
        </button>
      )}
      {showOpen && (
        <div className="p-3 rounded-lg border border-gray-200 bg-white space-y-2">
          <label htmlFor="hold-reason" className="block text-sm font-medium text-gray-700">Lý do khoá <span className="text-red-600">*</span></label>
          <input id="hold-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" autoFocus />
          <div className="flex gap-2">
            <button type="button" disabled={!reason.trim() || busy} onClick={() => void submitOpen()} className="px-3 py-1.5 rounded bg-brand text-white text-sm font-semibold disabled:opacity-50">{busy ? 'Đang khoá…' : 'Khoá'}</button>
            <button type="button" onClick={() => { setShowOpen(false); setReason('') }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">Huỷ</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  )
}
