import {
  EXCLUSION_CODE_LABELS,
  NEUTRAL_REASON_CODES,
  REASON_CODE_LABELS,
  formatRawScore,
} from '@/services/matchRoundService'
import type { MatchExclusion } from '@/services/matchRoundService'

/**
 * Lý do một ứng viên vào danh sách — nguyên tắc 11.
 *
 * Nhãn thuật toán hiện **nhỏ và mờ ở dưới**, không phải cột chính: nó giống nhau ở mọi dòng nên nó trả lời câu
 * "hệ thống chạy bằng gì", không phải câu "vì sao là bản ghi này". Vòng nhập từ hệ cũ không có mã lý do nào, và
 * ô trống ở đó phải đọc thành *không biết* chứ không phải *không có lý do*.
 */
export function ReasonCodes({ codes, algorithm }: { codes: string[]; algorithm: string | null }) {
  return (
    <div className="space-y-1">
      {codes.length === 0 ? (
        <span className="text-xs text-gray-500">Không ghi lý do — vòng nhập từ hệ cũ</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {codes.map((code) => (
            <span
              key={code}
              title={code}
              className={
                'inline-block px-1.5 py-0.5 rounded text-[11px] border ' +
                (NEUTRAL_REASON_CODES.has(code)
                  ? 'bg-gray-50 border-gray-200 text-gray-600'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800')
              }
            >
              {REASON_CODE_LABELS[code] ?? code}
            </span>
          ))}
        </div>
      )}
      {algorithm && <p className="font-mono text-[10px] text-gray-400">{algorithm}</p>}
    </div>
  )
}

/**
 * Ứng viên bị loại — vế thứ hai của nguyên tắc 11.
 *
 * Đặt **dưới** danh sách chọn và mặc định mở, không giấu sau một nút: giấu nó đi thì nó chỉ được xem khi người
 * ta đã nghi ngờ, mà lúc đó thường đã muộn. Thứ tự do máy chủ quyết định (điểm giảm dần — trượt sát ngưỡng nhất
 * lên đầu) và giao diện không sắp lại.
 */
export function ExclusionsTable({ exclusions, scoringMode }: { exclusions: MatchExclusion[]; scoringMode: string }) {
  if (exclusions.length === 0) {
    return (
      <p className="p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-700">
        Không có ứng viên nào bị loại trong vòng này.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-amber-50 text-left text-xs text-amber-900">
          <tr>
            <th className="px-3 py-2">Bản ghi bị loại</th>
            <th className="px-3 py-2">Điểm</th>
            <th className="px-3 py-2">Vì sao bị loại</th>
            <th className="px-3 py-2">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {exclusions.map((x) => (
            <tr key={x.id} className="border-t border-amber-100">
              <td className="px-3 py-2">
                <span className="text-xs text-gray-500">{x.candidate.kind}</span>
                <br />
                <span className="font-mono text-xs">{x.candidate.id}</span>
              </td>
              <td className="px-3 py-2 font-mono">
                {x.rawScore === null ? (
                  <span className="text-xs text-gray-500" title="Bị loại trước bước chấm điểm">chưa chấm</span>
                ) : (
                  formatRawScore(x.rawScore, scoringMode)
                )}
              </td>
              <td className="px-3 py-2">
                <span className="inline-block px-1.5 py-0.5 rounded text-[11px] border bg-amber-50 border-amber-200 text-amber-900" title={x.reasonCode}>
                  {EXCLUSION_CODE_LABELS[x.reasonCode] ?? x.reasonCode}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-gray-600">{x.detail ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
