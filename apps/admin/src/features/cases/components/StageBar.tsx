import { Lock } from 'lucide-react'
import {
  MAIN_STAGES,
  STAGE_LABELS,
  SUCCESSFUL_TERMINAL_STAGES,
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
 * Chín giai đoạn chính vẽ thành một dải theo thứ tự; các đường ra kết thúc vẽ riêng dưới dải, với chữ trên nút
 * đổi theo giai đoạn: từ chối chỉ có tới hết thẩm tra, sau đó là rút lui hoặc huỷ.
 *
 * Từ ADR-0013 có **bốn** đường ra chứ không phải ba, và một trong bốn là kết thúc thành công: bàn giao cho một
 * quy trình có thẩm quyền bên ngoài. Nó được tô xanh chứ không đỏ — ba đường kia nghĩa là hỏng, đường này thì không.
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
          {stage === 'HANDED_OVER' ? (
            <>
              Hồ sơ đã <strong>bàn giao</strong> cho một quy trình có thẩm quyền bên ngoài và kết thúc tại đây.
              Kết quả của quy trình đó thuộc hệ thống của cơ quan nhận — không suy ra được từ hồ sơ này.
            </>
          ) : (
            <>Hồ sơ đã đóng ở giai đoạn <strong>{STAGE_LABELS[stage]}</strong>. Không đi đâu được nữa.</>
          )}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Đường ra:</span>
          {TERMINAL_OUTLETS.filter((s) => reachable.has(s)).map((s) => {
            // ADR-0013: bàn giao là kết thúc **thành công**. Tô nó đỏ như từ chối/rút lui/huỷ là dạy người dùng
            // hiểu ngược — và đó đúng là hiểu lầm mà ADR-0013 sinh ra để sửa.
            const successful = SUCCESSFUL_TERMINAL_STAGES.has(s)
            const tone = successful
              ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
              : 'border-red-300 text-red-700 hover:bg-red-50'
            return (
              <button
                key={s}
                type="button"
                disabled={hasOpenHold}
                onClick={() => onPick(s)}
                title={successful ? 'Kết thúc thành công: quyết định chuyển sang một quy trình có thẩm quyền bên ngoài' : undefined}
                className={`px-3 py-1.5 rounded text-xs font-medium border bg-white disabled:opacity-50 disabled:cursor-not-allowed ${tone}`}
              >
                {transitionVerb(stage, s)}
              </button>
            )
          })}
          {hasOpenHold && <span className="text-xs text-amber-800">Đang bị khoá — gỡ khoá trước khi chuyển.</span>}
        </div>
      )}
    </div>
  )
}
