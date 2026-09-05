import { useCallback, useEffect, useState } from 'react'
import { beginOperation, getErrorMessage, normalizeError } from '@/lib/api/client'
import {
  assignLeadBroker,
  classifyWriteError,
  getCase,
  getDemandBriefHead,
  getTimeline,
  openHold,
  releaseHold,
  transitionCase,
} from '@/services/caseService'
import type { CaseRecord, DecisionRecord, DemandBriefHead, TransitionBody, WriteFailure } from '@/services/caseService'

/**
 * Hai lời gọi khi vào màn: hồ sơ và dòng thời gian. Hồ sơ mang số phiên bản và hook **giữ nó** trong
 * `caseRecord.version`; mọi lệnh ghi đọc từ đó và cập nhật từ phản hồi — không tự đoán số mới.
 *
 * Mỗi lệnh ghi bắt đầu một `Operation` mới (khoá chống lặp mới): người dùng sửa dữ liệu rồi gửi lại là một
 * thao tác **mới**, và nó phải có khoá mới — kể cả sau một 409.
 */
export function useCaseDetail(id: string) {
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null)
  const [timeline, setTimeline] = useState<DecisionRecord[]>([])
  /** `undefined` = chưa hỏi; `null` = hỏi rồi mà không đọc được (không tồn tại, hoặc không có quyền). */
  const [demand, setDemand] = useState<DemandBriefHead | null | undefined>(undefined)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [c, t] = await Promise.all([getCase(id), getTimeline(id)])
      setCaseRecord(c)
      setTimeline(t)
      setStatus('ready')
      // Lời gọi thứ ba, tách khỏi hai lời gọi trên: nó có thể hỏng vì quyền đọc đề bài khác quyền đọc hồ sơ,
      // và khi đó console vẫn phải hiện — chỉ ô "đề bài đang ghim" nói là không so được.
      try {
        setDemand(await getDemandBriefHead(c.demandBriefId))
      } catch {
        setDemand(null)
      }
    } catch (err) {
      // 404 gộp "không tồn tại" và "không phải bên tham gia" — máy chủ cố ý không tách, và câu chữ phải nói cả hai.
      if (normalizeError(err).status === 404) setStatus('not-found')
      else {
        setError(getErrorMessage(err))
        setStatus('error')
      }
    }
  }, [id])

  useEffect(() => {
    setStatus('loading')
    void load()
  }, [load])

  /** Cập nhật phần đầu từ phản hồi, rồi tải lại dòng thời gian (phản hồi không mang nó). */
  const applyWrite = useCallback(async (updated: CaseRecord) => {
    setCaseRecord(updated)
    try {
      setTimeline(await getTimeline(id))
    } catch {
      /* dòng thời gian cũ vẫn đúng tới trước lệnh này; lần tải sau sẽ bù */
    }
  }, [id])

  /**
   * 409: tải lại hồ sơ, trả về giai đoạn cũ → mới để hộp thoại nói được "hồ sơ vừa được người khác cập nhật".
   * Hộp thoại giữ diễn giải; hook chỉ đổi phần đầu và số phiên bản.
   */
  const transition = useCallback(async (body: TransitionBody): Promise<{ ok: true } | ({ ok: false } & WriteFailure)> => {
    if (!caseRecord) return { ok: false, kind: 'other', code: null, message: 'Chưa tải hồ sơ' }
    try {
      await applyWrite(await transitionCase(id, body, beginOperation()))
      return { ok: true }
    } catch (err) {
      const failure = classifyWriteError(err)
      if (failure.kind === 'conflict') {
        const previousStage = caseRecord.stage
        try {
          const fresh = await getCase(id)
          setCaseRecord(fresh)
          setTimeline(await getTimeline(id))
          return { ok: false, ...failure, previousStage, currentStage: fresh.stage }
        } catch {
          return { ok: false, ...failure, previousStage }
        }
      }
      return { ok: false, ...failure }
    }
  }, [applyWrite, caseRecord, id])

  const doOpenHold = useCallback(async (reason: string): Promise<string | null> => {
    try {
      await applyWrite(await openHold(id, reason, beginOperation()))
      return null
    } catch (err) {
      return getErrorMessage(err)
    }
  }, [applyWrite, id])

  const doReleaseHold = useCallback(async (holdId: string, rationale: string): Promise<string | null> => {
    try {
      await applyWrite(await releaseHold(id, holdId, rationale, beginOperation()))
      return null
    } catch (err) {
      return getErrorMessage(err)
    }
  }, [applyWrite, id])

  const doAssignBroker = useCallback(async (brokerPersonId: string): Promise<string | null> => {
    if (!caseRecord) return 'Chưa tải hồ sơ'
    try {
      await applyWrite(await assignLeadBroker(id, brokerPersonId, caseRecord.version, beginOperation()))
      return null
    } catch (err) {
      const f = classifyWriteError(err)
      if (f.kind === 'conflict') void load()
      return getErrorMessage(err)
    }
  }, [applyWrite, caseRecord, id, load])

  return { caseRecord, timeline, demand, status, error, reload: load, transition, openHold: doOpenHold, releaseHold: doReleaseHold, assignBroker: doAssignBroker }
}
