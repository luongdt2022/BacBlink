# Research: Match on Original Content Only

**Feature**: 013-match-original-content
**Date**: 2026-05-25
**Status**: Complete — no NEEDS CLARIFICATION items

## Decision Log

### D-001: What text is currently used for matching query vectors?

**Decision**: Currently `computeMatches`, `computeMatchesManual`, and `findMatchingChallenges` all build queryText using `aiProcessTitle ?? title` and `aiProcessedContent ?? content`. This means matching quality depended on whether beautify had been run.

**Rationale for change**: Using original content makes matching deterministic and independent of beautification state. Users should not have to beautify before they can get matches.

**Code locations**:
- `src/intakes/intakes.service.ts:851–856` (`computeMatches`)
- `src/intakes/intakes.service.ts:956–961` (`findMatchingChallenges`)
- `src/database/scripts/backfill-matches.ts:142–147`

---

### D-002: What does the BM25 query currently search on in Elasticsearch?

**Decision**: The BM25 `should` clause searches three fields:
- `text` (chunk text, from original content) — boost 1.0
- `intake_title` (original title) — boost 2.0
- `ai_process_title` (beautified title) — boost 1.5 ← **to be removed**

`ai_process_title` with boost 1.5 means intakes that have been beautified rank higher in BM25 than un-beautified intakes with otherwise equal content. This unfairness is eliminated by removing the field from BM25 scoring.

**Code locations**:
- `src/search/search.service.ts:118`
- `src/database/scripts/backfill-matches.ts:68`

**Alternatives considered**: Keeping `ai_process_title` in BM25 with lower boost (0.5). Rejected — even a low boost creates inequality between beautified and un-beautified intakes.

---

### D-003: Does removing `ai_process_title` from BM25 require a re-index?

**Decision**: No re-index required. The field remains stored in the ES document (for display in search results). Only the query shape changes — no mapping change. Existing documents remain valid.

**Rationale**: ES `_source` is separate from the inverted index used for BM25. We are not changing what is stored, only what we query against.

---

### D-004: What guard currently blocks `computeMatchesManual` when beautify hasn't run?

**Decision**: Line 930–933 in `intakes.service.ts` throws 422 `"has no AI-processed content — please run /beautify first"` if `aiProcessedContent` is null.

This guard is entirely removed. The new guard checks `content` (original), which is the actual prerequisite for matching.

**Impact on spec 010 quickstart**: Scenario 3 in `specs/010-manual-intake-match/quickstart.md` ("Reject match when aiProcessedContent is missing") becomes obsolete and must be removed.

---

### D-005: Does `beautifyIntake` still enqueue COMPUTE_MATCHES after this change?

**Decision**: Yes, unchanged. After beautify completes, the system still enqueues `COMPUTE_MATCHES` if `matchingAuto` is enabled. That job will now use original content (consistent with the new logic). No code change needed in `beautifyIntake`.

---

### D-006: Does `applyChunkEmbedding` already use original content?

**Decision**: Yes. `applyAiProcessing` already calls `applyChunkEmbedding(intake.id, intake.content)` with original content. This path needs no change.

---

### D-007: Files in scope

| File | Change type |
|------|-------------|
| `src/intakes/intakes.service.ts` | Logic change (3 methods) |
| `src/search/search.service.ts` | BM25 query change (1 line) |
| `src/database/scripts/backfill-matches.ts` | Logic + BM25 query (2 locations) |
| `specs/010-manual-intake-match/quickstart.md` | Doc update |

**Out of scope**: `elasticsearch.service.ts` (interface/mapping untouched), `reindex-es.ts` (document build untouched), `seed-intakes/shared.ts` (seeds untouched), any entity or migration.
