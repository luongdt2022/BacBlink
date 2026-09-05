import { Lock } from 'lucide-react'
import {
  MAIN_STAGES,
  STAGE_LABELS,
  TERMINAL_OUTLETS,
  isTerminal,
  reachableStages,
  transitionVerb,
} from '@/services/caseService'
import type { CaseStage } from '@/services/caseService'

interface StageBarProps {
  stage: CaseStage
  hasOpenHold: boolean
  onPick: (to: CaseStage) => void
}

/**
 * Thanh giai đoạn. **Chỉ giai đoạn đi tới được mới bấm được** — ma trận chuyển là dữ liệu cố định, và hiện đủ
 * 11 đích rồi để máy chủ từ chối 9 là bắt người dùng học luật bằng cách bị từ chối.
 *
 * Chín giai đoạn chính vẽ thành một dải theo thứ tự; ba đường ra kết thúc (từ chối / rút lui / huỷ) vẽ riêng
 * dưới dải, với chữ trên nút đổi theo giai đoạn: từ chối chỉ có tới hết thẩm tra, sau đó là rút lui hoặc huỷ.
 */
export function StageBar({ stage, hasOpenHold, onPick }: StageBarProps) {
  const reachable = new Set(reachableStages(stage))
  const currentIndex = MAIN_STAGES.indexOf(stage as (typeof MAIN_STAGES)[number])
  const closed = isTerminal(stage)

  return (
    <div className="space-y-3">
      <ol className="flex flex-wrap gap-1" aria-label="Giai đoạn">
        {MAIN_STAGES.map((s, i) => {
          const isCurrent = s === stage
          const canGo = reachable.has(s) && !hasOpenHold
          const done = currentIndex >= 0 && i < currentIndex
          const base = 'px-3 py-1.5 rounded text-xs font-medium border transition-colors'
          const tone = isCurrent
            ? 'bg-brand text-white border-brand'
            : canGo
              ? 'bg-white text-gray-900 border-gray-400 hover:bg-gray-100 cursor-pointer'
              : done
                ? 'bg-gray-100 text-gray-500 border-gray-200'
                : 'bg-gray-50 text-gray-400 border-gray-200'
          return (
            <li key={s}>
              {canGo ? (
                <button type="button" onClick={() => onPick(s)} className={`${base} ${tone}`} title={transitionVerb(stage, s)}>
                  {STAGE_LABELS[s]}
                </button>
              ) : (
                <span aria-current={isCurrent ? 'step' : undefined} className={`${base} ${tone}`}>{STAGE_LABELS[s]}</span>
              )}
            </li>
          )
        })}
      </ol>

      {closed ? (
        <p className="text-sm text-gray-700 inline-flex items-center gap-2">
          <Lock className="w-4 h-4" aria-hidden="true" />
          Hồ sơ đã đóng ở giai đoạn <strong>{STAGE_LABELS[stage]}</strong>. Không đi đâu được nữa.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Đường ra:</span>
          {TERMINAL_OUTLETS.filter((s) => reachable.has(s)).map((s) => (
            <button
              key={s}
              type="button"
              disabled={hasOpenHold}
              onClick={() => onPick(s)}
              className="px-3 py-1.5 rounded text-xs font-medium border border-red-300 text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {transitionVerb(stage, s)}
            </button>
          ))}
          {hasOpenHold && <span className="text-xs text-amber-800">Đang bị khoá — gỡ khoá trước khi chuyển.</span>}
        </div>
      )}
    </div>
  )
}
