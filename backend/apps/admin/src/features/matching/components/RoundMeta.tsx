import { AlertTriangle } from 'lucide-react'
import { ENGINE_LABELS, SCORING_MODE_LABELS, isImportedRound } from '@/services/matchRoundService'
import type { MatchRound } from '@/services/matchRoundService'

/** Bốn thông tin phải lộ ra, cộng thời điểm — dùng chung cho vòng mới nhất, chi tiết một vòng và hai cột so sánh. */
export function RoundMeta({ round, compact = false }: { round: MatchRound; compact?: boolean }) {
  const imported = isImportedRound(round)
  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5'}`}>
      <Meta label="Thời điểm" value={new Date(round.createdAt).toLocaleString('vi-VN')} />
      <Meta label="Chế độ chấm điểm" value={SCORING_MODE_LABELS[round.scoringMode] ?? round.scoringMode} hint={round.scoringMode} />
      <Meta label="Công cụ tìm kiếm" value={ENGINE_LABELS[round.searchEngineVersion] ?? round.searchEngineVersion} hint={round.searchEngineVersion} warn={imported} />
      <Meta label="Mô hình nhúng" value={round.embeddingModelVersion} mono />
      <Meta label="Số ứng viên" value={String(round.candidateCount)} />
    </div>
  )
}

export function ImportedBanner() {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <p>
        <strong>Vòng nhập từ hệ cũ.</strong> Đây không phải một lần tính: điểm được chép nguyên từ bảng ghép cặp của
        hệ NestJS, không chuẩn hoá, không có câu truy vấn để dựng lại. Không so nó với một vòng đã tính trên nền tảng mới.
      </p>
    </div>
  )
}

function Meta({ label, value, hint, mono = false, warn = false }: { label: string; value: string; hint?: string; mono?: boolean; warn?: boolean }) {
  return (
    <div className={`p-3 rounded-lg border bg-white ${warn ? 'border-amber-300' : 'border-gray-200'}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm mt-0.5 ${mono ? 'font-mono' : 'font-medium'} ${warn ? 'text-amber-800' : 'text-gray-900'}`}>{value}</p>
      {hint && hint !== value && <p className="text-[10px] font-mono text-gray-400 mt-0.5 break-all">{hint}</p>}
    </div>
  )
}
