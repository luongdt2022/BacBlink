# Feature Specification: Match on Original Content Only

**Feature Branch**: `013-match-original-content`
**Created**: 2026-05-25
**Status**: Draft
**Input**: User description: "Cập nhật matching system để chỉ dùng data gốc (original content) thay vì beautified content cho chunk, embed, BM25 query và compute-matches. Bỏ guard bắt buộc beautify trước khi match."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trigger matching without prior beautification (Priority: P1)

A user publishes an intake with title and content, then immediately triggers matching — without needing to call `/beautify` first. The system finds relevant matches using the original title and content.

**Why this priority**: Removing the beautify-first gate unblocks users from accessing matching as soon as they publish. Beautification is now a purely cosmetic action decoupled from matching.

**Independent Test**: Create a published intake with only original title and content (no `/beautify` called). Call `/my/intakes/:id/compute-matches`. Verify matches are queued successfully and results appear in `intake_matches` based on original content.

**Acceptance Scenarios**:

1. **Given** a published intake with original `title` and `content` and no `aiProcessedContent`, **When** the user calls `compute-matches`, **Then** the system queues matching and returns 200 with `{ message: "Matching has been queued" }`.
2. **Given** a published intake with no `content` at all, **When** the user calls `compute-matches`, **Then** the system returns 422 indicating there is no content to match.
3. **Given** a published intake that has been beautified, **When** the user calls `compute-matches`, **Then** matching uses original `content` (not `aiProcessedContent`) as the query basis.

---

### User Story 2 - Chunks and embeddings always reflect original content (Priority: P1)

When an intake is created or updated, the system chunks and embeds only the raw original `content` field. The AI-beautified content never influences what gets stored in the vector index or Elasticsearch.

**Why this priority**: Matching quality must be consistent and predictable. Using beautified content creates a two-tier system where un-beautified intakes are disadvantaged in search.

**Independent Test**: Create an intake, note original content. Run `/beautify`. Verify that `intake_chunks` rows and Elasticsearch documents still contain text derived only from original `content`.

**Acceptance Scenarios**:

1. **Given** an intake saved with original `content`, **When** AI processing completes, **Then** all chunks in `intake_chunks` are derived from original `content` only.
2. **Given** an intake that has been beautified (has `aiProcessedContent`), **When** matching is triggered, **Then** the query vector is built from original `title` + `content`, not from `aiProcessTitle` + `aiProcessedContent`.
3. **Given** a BM25 keyword search in Elasticsearch, **Then** only `text` (chunk text from original content) and `intake_title` (original title) contribute to the BM25 score — `ai_process_title` is excluded from the scoring clause.

---

### User Story 3 - Admin triggers matching on any published intake (Priority: P2)

An admin can trigger `compute-matches` on any published intake regardless of whether it has been beautified, using only original content for matching.

**Why this priority**: Consistent behavior between user and admin flows. Admin should not need to beautify before matching either.

**Independent Test**: As admin, call `POST /admin/intakes/:id/compute-matches` on a published intake that has never been beautified. Verify 200 response and that matches appear in `intake_matches`.

**Acceptance Scenarios**:

1. **Given** a published intake without `aiProcessedContent`, **When** admin triggers matching, **Then** matching is queued successfully (200, no 422 about missing AI content).
2. **Given** a draft intake, **When** admin triggers matching, **Then** system returns 422 (status gate still enforced).

---

### User Story 4 - Backfill script uses original content (Priority: P2)

The `backfill-matches` maintenance script recomputes matches for all intakes using original `title` + `content` as the query vector, without requiring `aiProcessedContent` to be set.

**Why this priority**: The backfill script must stay consistent with the runtime matching logic to avoid divergent results.

**Independent Test**: Run `npm run backfill:matches`. Verify that intakes without `aiProcessedContent` are not skipped, and computed matches align with runtime `compute-matches` output for the same intake.

**Acceptance Scenarios**:

1. **Given** an intake with chunking completed but no `aiProcessedContent`, **When** the backfill script runs, **Then** matches are computed using original `title` + `content` (intake is not skipped).
2. **Given** the backfill BM25 query, **When** it runs against Elasticsearch, **Then** `ai_process_title` is not included in the BM25 `should` clauses.

---

### Edge Cases

- What if `content` is null or empty? System must skip matching gracefully (422 from endpoint, silent skip in backfill script).
- What if `content` is extremely long (> 1500 chars)? Query truncates to first 1500 characters.
- What if beautify has been run and `aiProcessedContent` exists? It is silently ignored for matching — only `content` is used.
- What if a user triggers matching multiple times without beautifying? Each run recomputes from original content consistently with no error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The matching query vector MUST be built from `title` (original) and `content` (original, truncated to 1500 chars), regardless of whether `aiProcessTitle` or `aiProcessedContent` exist.
- **FR-002**: The `compute-matches` endpoint MUST NOT require `aiProcessedContent` to be set; pre-conditions are: intake exists, intake is published, intake has non-empty `content`.
- **FR-003**: The `compute-matches` endpoint MUST return 422 when `content` is empty or null, with a clear message indicating no content is available for matching.
- **FR-004**: The Elasticsearch BM25 query MUST search only on `text` (chunk text) and `intake_title` (original title) fields; `ai_process_title` MUST NOT be included in the BM25 `should` clause.
- **FR-005**: The `ai_process_title` field MAY remain stored in Elasticsearch documents for display/return purposes but MUST NOT influence matching scores.
- **FR-006**: The `intake_chunks` table and Elasticsearch index MUST only contain text and embeddings derived from original `content`.
- **FR-007**: The `backfill-matches` script MUST use `title` + `content` (original) as the query text, consistent with the runtime matching logic.
- **FR-008**: The `backfill-matches` script MUST NOT skip intakes solely because `aiProcessedContent` is missing; the only skip condition is empty `content`.
- **FR-009**: The `backfill-matches` BM25 query MUST NOT include `ai_process_title` in its `should` clauses.
- **FR-010**: The `findMatchingChallenges` endpoint (seller-perspective live search) MUST also use original `title` + `content` as the query, not beautified fields.
- **FR-011**: The quickstart doc for manual matching MUST be updated to remove the beautify prerequisite and the scenario that validates rejection when `aiProcessedContent` is missing.

### Key Entities

- **Intake**: Has `title` (original), `content` (original), `aiProcessTitle` (beautified, optional), `aiProcessedContent` (beautified, optional). Matching depends only on `title` + `content`.
- **IntakeChunk**: Text chunks and embeddings derived exclusively from original `content`. Never updated by beautify.
- **IntakeMatch**: Pre-computed match pairs between IP and Challenge intakes, computed using original content query vectors.
- **Elasticsearch document**: Contains `text`, `embedding`, `intake_title`, `ai_process_title` (stored for display only, not scored in BM25), `intake_type`, `sector_ids`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A newly published intake (with no beautification) can successfully trigger `compute-matches` and receive match results — no 422 errors about missing AI content.
- **SC-002**: Zero intakes with non-empty `content` are skipped by the backfill script due to missing `aiProcessedContent`.
- **SC-003**: Matching results for an intake are identical before and after beautification is applied, confirming beautified content does not affect matching.
- **SC-004**: The `compute-matches` endpoint returns 200 for any published intake with non-empty `content`, and 422 only when `content` is absent.
- **SC-005**: The manual match quickstart documentation no longer references a beautify prerequisite, and all described scenarios pass against the updated implementation.

## Assumptions

- `ai_process_title` is kept in the Elasticsearch document and returned in search results for display purposes — it is only removed from BM25 scoring, not from the index mapping or response payload.
- The Elasticsearch index mapping does not need to change; no re-index is required since `ai_process_title` stays in the document and the only change is to the query shape.
- The `beautifyIntake` flow (LLM call, updating `aiProcessTitle`/`aiProcessedContent`) is unchanged — beautify remains a standalone cosmetic feature.
- After beautify runs, the system still enqueues `COMPUTE_MATCHES`; that job will use original content consistent with FR-001.
- The `findMatchingChallenges` endpoint at `GET /my/intakes/:id/find-challenges` is in scope for this change.
- No database migration is required — no schema changes, only query logic changes in service and script files.
