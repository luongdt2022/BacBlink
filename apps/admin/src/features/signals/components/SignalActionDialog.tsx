import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getErrorMessage } from '@/lib/api/client'
import type { DemandSignal } from '@/services/signalService'

export type SignalAction = 'reject' | 'convert'

interface SignalActionDialogProps {
  signal: DemandSignal
  action: SignalAction
  onConfirm: (value: string) => Promise<void>
  onClose: () => void
}

const COPY: Record<SignalAction, {
  title: string
  label: string
  hint: string
  placeholder: string
  confirm: string
  multiline: boolean
}> = {
  reject: {
    title: 'Loại tín hiệu',
    label: 'Vì sao loại',
    hint: 'Bắt buộc. Tín hiệu bị loại vẫn được giữ lại — nó là dữ liệu để đo nguồn nào đáng tiền. Không có lý do thì không đo được gì.',
    placeholder: 'Ví dụ: ngoài lĩnh vực đang phục vụ; bên mua đã tự giải quyết; trùng với tín hiệu khác',
    confirm: 'Loại tín hiệu',
    multiline: true,
  },
  convert: {
    title: 'Ghi nhận đã thành đề bài',
    label: 'Định danh đề bài',
    hint: 'Đường này KHÔNG tạo đề bài. Chỉ người có thẩm quyền xác nhận chủ bài toán, mục tiêu, baseline và đường ngân sách mới tạo được nhu cầu đủ điều kiện — hãy tạo ở màn hình đề bài trước, rồi dán định danh vào đây để giữ nguồn gốc.',
    placeholder: '00000000-0000-0000-0000-000000000000',
    confirm: 'Ghi nhận',
    multiline: false,
  },
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Hộp thoại cho hai thao tác của bàn tín hiệu.
 *
 * Thay `window.prompt` vì ba lý do đo được, không phải vì thẩm mỹ: `prompt` không hiện được lỗi máy chủ nên
 * người dùng mất nguyên phần đã gõ khi lệnh hỏng; nó không kiểm được dạng dữ liệu trước khi gửi; và nó chặn
 * luồng trình duyệt nên không có trạng thái "đang gửi".
 *
 * Escape huỷ, Ctrl/Cmd+Enter gửi. Lệnh hỏng thì hộp thoại **không đóng** và giữ nguyên nội dung đang gõ.
 */
export function SignalActionDialog({ signal, action, onConfirm, onClose }: SignalActionDialogProps) {
  const copy = COPY[action]
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Hai ref thay vì một ref hợp kiểu: chỉ một trong hai ô được dựng, và hai ref rẻ hơn một phép ép kiểu.
  const textRef = useRef<React.ElementRef<'textarea'>>(null)
  const lineRef = useRef<React.ElementRef<'input'>>(null)

  useEffect(() => {
    ;(textRef.current ?? lineRef.current)?.focus()
  }, [])

  const trimmed = value.trim()
  const malformedId = action === 'convert' && trimmed.length > 0 && !UUID.test(trimmed)
  const canSubmit = trimmed.length > 0 && !malformedId && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(trimmed)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      void submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="sig-dlg-title">
      <div className="w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-xl" onKeyDown={onKeyDown}>
        <div>
          <h2 id="sig-dlg-title" className="text-lg font-semibold text-gray-900">{copy.title}</h2>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{signal.title}</p>
        </div>

        <div>
          <label htmlFor="sig-dlg-input" className="mb-1 block text-sm font-medium text-gray-700">
            {copy.label} <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          {copy.multiline ? (
            <textarea
              id="sig-dlg-input"
              ref={textRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder={copy.placeholder}
              aria-describedby="sig-dlg-hint"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          ) : (
            <input
              id="sig-dlg-input"
              ref={lineRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={copy.placeholder}
              aria-describedby="sig-dlg-hint"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          )}
          <p id="sig-dlg-hint" className="mt-1 text-xs text-gray-600">{copy.hint}</p>
          {malformedId && (
            <p className="mt-1 text-xs text-amber-800">Không giống một định danh — kiểm tra lại trước khi gửi.</p>
          )}
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Huỷ</button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Đang gửi…' : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
