import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, Copy, Info } from 'lucide-react'
import { getErrorMessage, normalizeError } from '@/lib/api/client'
import {
  COI_LABELS,
  GATE_LABELS,
  STAGES_IN_ORDER,
  getPolicySnapshot,
  parsePolicyDocument,
} from '@/services/policySnapshotService'
import type { PolicyDocument, PolicySnapshot } from '@/services/policySnapshotService'
import { STAGE_LABELS, TRACK_LABELS, getCase } from '@/services/caseService'
import type { CaseRecord } from '@/services/caseService'

/**
 * Trang đọc một ảnh chụp chính sách (`moi/anh-chup-chinh-sach.md`).
 *
 * Trang nhận **định danh ảnh chụp** trên đường dẫn, không phải định danh hồ sơ: ảnh chụp là tài liệu có định
 * danh riêng, và một hồ sơ có thể có nhiều bản (bản mới thay bản cũ). Nó cần thêm hồ sơ để trả lời một câu
 * endpoint ảnh chụp không trả lời được — bản này còn hiện hành hay đã bị thay thế — vì chiều "bị thay bởi"
 * không có trên bản ghi; chỉ có `policySnapshotId` của hồ sơ nói được bản nào đang áp.
 *
 * Không có gì được focus sẵn. Đây là trang đọc.
 */
export function PolicySnapshotPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [snapshot, setSnapshot] = useState<PolicySnapshot | null>(null)
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'hash' | 'document' | null>(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    ;(async () => {
      try {
        const s = await getPolicySnapshot(id)
        if (cancelled) return
        setSnapshot(s)
        // Hồ sơ đọc được thì mới đọc được ảnh chụp (máy chủ đã kiểm), nên lời gọi thứ hai không thêm rủi ro
        // quyền; nó chỉ có thể hỏng vì lý do mạng, và khi đó ta vẫn hiện được ảnh chụp.
        try {
          setCaseRecord(await getCase(s.caseId))
        } catch {
          setCaseRecord(null)
        }
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const normalized = normalizeError(err)
        if (normalized.status === 404) setStatus('not-found')
        else {
          setError(getErrorMessage(err))
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const copy = async (what: 'hash' | 'document', text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  if (status === 'loading') return <p className="p-6 text-sm text-gray-600">Đang tải ảnh chụp…</p>

  if (status === 'not-found') {
    /* 404 cố ý gộp "không tồn tại" và "không được đọc hồ sơ": định danh ảnh chụp trỏ về sự tồn tại của một hồ
       sơ, nên tách hai trường hợp là xác nhận hồ sơ đó có thật. Câu chữ phải nói cả hai khả năng. */
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">Ảnh chụp chính sách</h1>
        <p className="text-sm text-gray-700">
          Không có ảnh chụp nào với định danh này, hoặc bạn không có quyền đọc hồ sơ mà nó thuộc về. Hệ thống
          không phân biệt hai trường hợp đó với người không có quyền.
        </p>
        <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Về danh sách hồ sơ
        </Link>
      </div>
    )
  }

  if (status === 'error' || !snapshot) {
    return (
      <div className="p-6">
        <p role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>
      </div>
    )
  }

  const doc = parsePolicyDocument(snapshot.documentJson)
  const isCurrent = caseRecord ? caseRecord.policySnapshotId === snapshot.id : null

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to={`/cases/${snapshot.caseId}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {caseRecord ? `${caseRecord.caseCode} — ${caseRecord.title}` : 'Về hồ sơ'}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Ảnh chụp chính sách</h1>
        <p className="text-sm text-gray-600 mt-1">
          Bộ luật đã chốt cho hồ sơ này khi nó vào thẩm định. Nội dung không đổi sau khi chốt.
        </p>
      </div>

      {/* Bốn thứ phải hiện ngay, không giấu sau tab. */}
      <section aria-label="Tóm tắt" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Fact label="Tuyến của hồ sơ" value={doc ? TRACK_LABELS[doc.track] ?? doc.track : '—'} mono={!doc} />
        <Fact label="Thời điểm chốt" value={new Date(snapshot.resolvedAt).toLocaleString('vi-VN')} />
        <Fact label="Phiên bản chính sách nền tảng" value={snapshot.platformPolicyVersion} mono />
        <Fact label="Phiên bản chính sách theo tuyến" value={snapshot.trackPolicyVersion} mono />
      </section>

      <section aria-label="Hiệu lực" className="p-4 rounded-lg border border-gray-200 bg-white text-sm space-y-2">
        {isCurrent === true && <p className="text-green-800 font-medium">Bản này đang hiện hành: hồ sơ đang áp đúng ảnh chụp này.</p>}
        {isCurrent === false && caseRecord && (
          <p className="text-amber-800 font-medium">
            Bản này <strong>đã bị thay thế</strong>.{' '}
            {caseRecord.policySnapshotId ? (
              <Link to={`/policy-snapshots/${caseRecord.policySnapshotId}`} className="underline">Mở bản đang áp</Link>
            ) : (
              'Hồ sơ hiện không ghim ảnh chụp nào.'
            )}
          </p>
        )}
        {isCurrent === null && (
          <p className="text-gray-600">Không đọc được hồ sơ để biết bản này còn hiện hành hay không.</p>
        )}
        {snapshot.supersedesId && (
          <p className="text-gray-700">
            Bản này thay thế{' '}
            <Link to={`/policy-snapshots/${snapshot.supersedesId}`} className="font-mono text-xs underline">{snapshot.supersedesId}</Link>.
          </p>
        )}
      </section>

      {/*
        Ghi chú kỹ thuật bắt buộc theo đặc tả: bảy nhóm cổng được GHI vào tài liệu nhưng chưa có mã nào đọc
        chúng để chặn một lệnh chuyển. Chữ trên màn hình không được khiến người đọc tin cổng đã được máy kiểm.
      */}
      <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Các cổng dưới đây là <strong>bộ luật đã ghi lại</strong>, chưa phải bộ luật đã thi hành. Lệnh chuyển giai
          đoạn hiện chỉ kiểm ma trận chuyển và bốn luật ngoài ma trận; nó chưa đọc tài liệu này để chặn.
        </p>
      </div>

      {doc ? (
        <>
          <section aria-label="Cổng theo giai đoạn" className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Cổng theo giai đoạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STAGES_IN_ORDER.map((stage) => {
                const gates = doc.gates[stage] ?? []
                return (
                  <div key={stage} className="p-3 rounded-lg border border-gray-200 bg-white">
                    <p className="text-sm font-medium text-gray-900">{STAGE_LABELS[stage] ?? stage}</p>
                    {gates.length === 0 ? (
                      <p className="text-xs text-gray-500 mt-1">Bộ chính sách này không đặt cổng cho giai đoạn này.</p>
                    ) : (
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                        {gates.map((g) => <li key={g}>{GATE_LABELS[g] ?? g}</li>)}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section aria-label="Xung đột lợi ích" className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Quy tắc xung đột lợi ích</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 p-3 rounded-lg border border-gray-200 bg-white">
              {Object.entries(doc.conflictOfInterest).map(([key, on]) => (
                <li key={key} className={on ? '' : 'line-through text-gray-400'}>{COI_LABELS[key] ?? key}</li>
              ))}
            </ul>
          </section>

          <section aria-label="Lớp lưu trữ" className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Lớp lưu trữ</h2>
            <p className="text-sm text-gray-700 font-mono">{doc.retentionClass}</p>
          </section>
        </>
      ) : (
        <p role="alert" className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          Không đọc được cấu trúc tài liệu. Bản thô và hash vẫn hiện ở dưới — một tài liệu không đọc được vẫn là tài liệu đã áp.
        </p>
      )}

      <section aria-label="Hash" className="space-y-3 p-4 rounded-lg border border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Bằng chứng nội dung không bị sửa</h2>
        <div className="flex gap-3 text-sm text-gray-700">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
          <p>
            Hash dưới đây được tính trên bản chuẩn hoá của tài liệu theo quy tắc <code className="font-mono">{doc?.canonicalizationVersion || '—'}</code>.
            Bất kỳ ai chép bản chuẩn hoá, chuẩn hoá lại theo đúng quy tắc đó rồi tính lại hash — nếu khớp, tài liệu
            đang đọc đúng là tài liệu đã áp lúc chốt; nếu lệch, đã có người sửa. Màn hình này <strong>không</strong> tự
            tính lại hash; nó chỉ hiện đủ thứ để người khác kiểm.
          </p>
        </div>
        <dl className="text-sm">
          <dt className="text-gray-600">Hash (SHA-256) · quy tắc chuẩn hoá {doc?.canonicalizationVersion || '—'}</dt>
          <dd className="flex items-center gap-2 mt-1">
            <code className="font-mono text-xs break-all">{snapshot.documentHash}</code>
            <button
              type="button"
              onClick={() => copy('hash', snapshot.documentHash)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-xs hover:bg-gray-50"
            >
              <Copy className="w-3 h-3" aria-hidden="true" /> {copied === 'hash' ? 'Đã chép' : 'Chép hash'}
            </button>
          </dd>
        </dl>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Bản chuẩn hoá, đúng nguyên văn</p>
            <button
              type="button"
              onClick={() => copy('document', snapshot.documentJson)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-xs hover:bg-gray-50"
            >
              <Copy className="w-3 h-3" aria-hidden="true" /> {copied === 'document' ? 'Đã chép' : 'Chép bản chuẩn hoá'}
            </button>
          </div>
          <pre className="mt-2 p-3 rounded bg-gray-50 border border-gray-200 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">{snapshot.documentJson}</pre>
        </div>
      </section>
    </div>
  )
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm text-gray-900 mt-0.5 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
    </div>
  )
}

export type { PolicyDocument }
