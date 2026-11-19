import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import {
  DECISIONS_REQUIRING_MANDATE_REF,
  DECISION_LABELS,
  STAGE_LABELS,
  decisionOptionsFor,
  transitionVerb,
} from '@/services/caseService'
import type { CaseStage, Decision, TransitionBody, WriteFailure } from '@/services/caseService'

export type SubmitResult = { ok: true } | ({ ok: false } & WriteFailure)

interface DecisionDialogProps {
  fromStage: CaseStage
  toStage: CaseStage
  /** Số phiên bản hiện giữ. Sau 409 cha tải lại và truyền số mới xuống; hộp thoại không tự đoán. */
  version: number
  onSubmit: (body: TransitionBody) => Promise<SubmitResult>
  onClose: () => void
  /** Nút "gán môi giới" ngay trong hộp thoại khi máy chủ trả CASE_01_LEAD_BROKER_REQUIRED. */
  onAssignBroker?: () => void
  /** Nút "gỡ khoá" ngay trong hộp thoại khi máy chủ trả CASE_ON_HOLD. */
  onReleaseHold?: () => void
}

/** Câu tiếng Việt nói *phải làm gì tiếp* cho từng mã 422 — không chỉ nói cái gì sai. */
const RULE_MESSAGES: Record<string, string> = {
  CASE_ON_HOLD: 'Hồ sơ đang bị khoá. Gỡ khoá trước khi chuyển giai đoạn.',
  CASE_01_LEAD_BROKER_REQUIRED: 'Cần gán môi giới chính trước khi chuyển sang thẩm định.',
}

/** Bốn mã chỉ xuất hiện khi giao diện và máy chủ bất đồng về ma trận — tín hiệu lỗi lập trình, không phải hướng dẫn. */
const MATRIX_DISAGREEMENT = new Set([
  'TRANSITION_NOT_ALLOWED',
  'REWORK_DECISION_REQUIRED',
  'REJECT_DECISION_REQUIRED',
  'WITHDRAW_DECISION_REQUIRED',
  'CANCEL_DECISION_REQUIRED',
  'FORWARD_DECISION_REQUIRED',
])

/**
 * Hộp thoại quyết định (`moi/console-ho-so-vu-viec.md`, "Bắt đầu sửa" và "Gửi đi").
 *
 * Ba việc giao diện làm mà máy chủ không làm hộ: chọn sẵn loại quyết định theo hướng chuyển (ô chọn chỉ tồn
 * tại khi có hai lựa chọn), bắt buộc diễn giải trước khi cho gửi, và đổi chữ trên nút theo giai đoạn.
 *
 * Bàn phím: Ctrl/Cmd+Enter gửi; Enter trong ô diễn giải xuống dòng; Escape huỷ — nếu đã gõ diễn giải thì hỏi
 * trước, vì mất vài câu vừa viết là cách chắc chắn khiến lần sau người ta viết ngắn đi.
 */
export function DecisionDialog({ fromStage, toStage, version, onSubmit, onClose, onAssignBroker, onReleaseHold }: DecisionDialogProps) {
  const options = decisionOptionsFor(fromStage, toStage)
  const [decision, setDecision] = useState<Decision>(options[0])
  const [reasonCodes, setReasonCodes] = useState('')
  const [rationale, setRationale] = useState('')
  const [mandateRef, setMandateRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<WriteFailure | null>(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const rationaleRef = useRef<React.ElementRef<'textarea'>>(null)

  useEffect(() => {
    rationaleRef.current?.focus()
  }, [])

  // ADR-0013: bàn giao đòi tham chiếu tới quy trình nhận. Máy chủ chặn bằng `HANDOVER_REFERENCE_REQUIRED`;
  // chặn ở đây để người dùng không soạn xong diễn giải rồi mới bị trả về.
  const mandateRequired = DECISIONS_REQUIRING_MANDATE_REF.has(decision)
  const canSubmit =
    rationale.trim().length > 0 &&
    (!mandateRequired || mandateRef.trim().length > 0) &&
    !submitting &&
    failure?.kind !== 'forbidden'

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setFailure(null)
    const result = await onSubmit({
      toStage,
      decision,
      reasonCodes: reasonCodes.split(',').map((s) => s.trim()).filter(Boolean),
      rationale: rationale.trim(),
      mandateRef: mandateRef.trim() || null,
      expectedVersion: version,
    })
    setSubmitting(false)
    // Thành công: cha đóng hộp thoại sau khi cập nhật từ phản hồi. Thất bại: hộp thoại KHÔNG đóng — kết quả có
    // thể là một lỗi cần sửa ngay tại đây, và ô diễn giải được giữ nguyên ở mọi nhánh.
    if (!result.ok) setFailure(result)
  }

  const requestClose = () => {
    if (rationale.trim() && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      void submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      requestClose()
    }
  }

  const verb = transitionVerb(fromStage, toStage)

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="decision-title" onKeyDown={onKeyDown} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl p-6 space-y-4">
        <div>
          <h2 id="decision-title" className="text-lg font-semibold text-gray-900">{verb}</h2>
          <p className="text-sm text-gray-600">
            {STAGE_LABELS[fromStage]} → {STAGE_LABELS[toStage]} · phiên bản {version}
          </p>
        </div>

        {failure?.kind === 'conflict' && (
          <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900" role="status">
            <RefreshCw className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Hồ sơ vừa được người khác cập nhật. Đã tải lại.
              {failure.previousStage && failure.currentStage && (
                <> Giai đoạn: <strong>{STAGE_LABELS[failure.previousStage]}</strong> → <strong>{STAGE_LABELS[failure.currentStage]}</strong>.</>
              )}{' '}
              Diễn giải của bạn được giữ nguyên; kiểm tra lại rồi gửi.
            </p>
          </div>
        )}

        {failure?.kind === 'rule' && (
          <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900" role="alert">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2">
              <p>{failure.code && RULE_MESSAGES[failure.code] ? RULE_MESSAGES[failure.code] : failure.message}</p>
              {failure.code && MATRIX_DISAGREEMENT.has(failure.code) && (
                <p className="text-xs">Mã {failure.code}: giao diện và máy chủ bất đồng về ma trận chuyển — đây là lỗi lập trình, đã ghi lại.</p>
              )}
              {failure.code === 'CASE_ON_HOLD' && onReleaseHold && (
                <button type="button" onClick={onReleaseHold} className="px-3 py-1.5 rounded border border-red-300 text-xs font-medium hover:bg-red-100">Gỡ khoá</button>
              )}
              {failure.code === 'CASE_01_LEAD_BROKER_REQUIRED' && onAssignBroker && (
                <button type="button" onClick={onAssignBroker} className="px-3 py-1.5 rounded border border-red-300 text-xs font-medium hover:bg-red-100">Gán môi giới chính</button>
              )}
            </div>
          </div>
        )}

        {failure?.kind === 'forbidden' && (
          <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">
            Bạn không có quyền chuyển giai đoạn hồ sơ này. Chỉ môi giới chính hoặc đồng môi giới của hồ sơ mới làm được. Thử lại sẽ hỏng y hệt.
          </p>
        )}

        {failure?.kind === 'other' && (
          <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">{failure.message}</p>
        )}

        {options.length > 1 ? (
          <div>
            <label htmlFor="d-decision" className="block text-sm font-medium text-gray-700 mb-1">Loại quyết định</label>
            <select id="d-decision" value={decision} onChange={(e) => setDecision(e.target.value as Decision)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {options.map((o) => <option key={o} value={o}>{DECISION_LABELS[o]}</option>)}
            </select>
          </div>
        ) : (
          /* Một lựa chọn thì không có ô chọn: hiện một danh sách một phần tử là hỏi một câu chỉ có một câu trả lời. */
          <p className="text-sm text-gray-700">Loại quyết định: <strong>{DECISION_LABELS[decision]}</strong></p>
        )}

        <div>
          <label htmlFor="d-rationale" className="block text-sm font-medium text-gray-700 mb-1">Diễn giải <span className="text-red-600">*</span></label>
          <textarea
            id="d-rationale"
            ref={rationaleRef}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Vì sao quyết định này. Enter xuống dòng; Ctrl+Enter để gửi."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="d-reasons" className="block text-sm font-medium text-gray-700 mb-1">Mã lý do</label>
            <input id="d-reasons" value={reasonCodes} onChange={(e) => setReasonCodes(e.target.value)} placeholder="Cách nhau bằng dấu phẩy" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label htmlFor="d-mandate" className="block text-sm font-medium text-gray-700 mb-1">
              Tham chiếu uỷ quyền{mandateRequired && <span className="text-red-600" aria-hidden="true"> *</span>}
            </label>
            <input
              id="d-mandate"
              value={mandateRef}
              onChange={(e) => setMandateRef(e.target.value)}
              required={mandateRequired}
              aria-describedby={mandateRequired ? 'd-mandate-hint' : undefined}
              placeholder={mandateRequired ? 'Ví dụ: HTMDTQG/IB-2026-0001' : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
            />
            {mandateRequired && (
              <p id="d-mandate-hint" className="mt-1 text-xs text-gray-600">
                Bắt buộc: bàn giao phải nói được bàn giao cho quy trình nào. Không có tham chiếu thì dòng thời
                gian chỉ còn một lời khai không kiểm chứng được.
              </p>
            )}
          </div>
        </div>

        {confirmDiscard && (
          <p className="text-sm text-amber-900 p-3 rounded-lg bg-amber-50 border border-amber-200" role="alert">
            Bỏ diễn giải đang viết? Bấm Huỷ lần nữa để bỏ, hoặc tiếp tục soạn.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={requestClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Huỷ</button>
          <button type="button" onClick={() => void submit()} disabled={!canSubmit} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Đang gửi…' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}
