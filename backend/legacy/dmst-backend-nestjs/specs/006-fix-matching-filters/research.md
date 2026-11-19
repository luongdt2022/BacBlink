# Research: Matching Filter — Cross-User & Published Only

**Branch**: `006-fix-matching-filters` | **Date**: 2026-03-27

## Decision 1: Where to apply the cross-user and published-status filters

**Decision**: Post-filter in `computeMatches` using a PostgreSQL lookup after ES returns hits.

**Rationale**:
The Elasticsearch `intake_chunks` index currently holds only:
`intake_id`, `chunk_index`, `text`, `embedding`, `intake_title`, `ai_process_title`,
`intake_type`, `sector_ids`, `sector_names`.

It does NOT store `user_id` or `status`. Two approaches were considered:

**Option A — Enrich the ES index** (add `user_id` + `status` fields to `IntakeChunkDoc`):
- Requires updating the ES mapping (new keyword fields)
- Requires a re-index job to populate `user_id`/`status` on all existing documents
- Requires updating `SearchService.indexIntake()` and `SearchDto` to pass the extra filter
- Cleanest at query time but highest scope and risk

**Option B — Post-filter via PostgreSQL** (preferred):
- `computeMatches` already fetches the source intake from PostgreSQL
- After ES returns ranked hits, do a single `WHERE id IN (...) AND status = 'published'
  AND (user_id != :ownerId OR :ownerId IS NULL)` query
- Filter the ES hits list to only those IDs that pass
- Zero index changes, zero schema migration, one targeted SQL check
- Constitution V (Simplicity) satisfied: minimum change for current need

**Alternatives considered**: Option A (ES-layer filter) — rejected because it requires a
migration-scale change (re-index) for a filter that runs only during `computeMatches`, not
during live search. The post-filter adds at most one extra DB round-trip per pipeline run.

## Decision 2: How to handle null userId (seed/admin intakes)

**Decision**: When the source intake's `userId` is null, skip the cross-user exclusion
filter but still apply `status = 'published'`.

**Rationale**: Seed/admin intakes have no owner. Excluding "same user" is meaningless
without an owner. The published-status filter, however, is always relevant — it prevents
draft intakes from being matched regardless of who owns them.

SQL pattern used:
```sql
WHERE id IN (:...ids)
  AND status = 'published'
  AND (:ownerId IS NULL OR user_id != :ownerId)
```

This handles both cases in one query without branching in application code.

## Decision 3: No changes to live-search (`find-challenges`) or read endpoints

**Decision**: The new filters apply only to `computeMatches` (pre-computed pipeline Step 4).
The `SearchService.search()` method used by live search (`/my/intakes/:id/find-challenges`)
and the read endpoints (`GET /intakes/:id/matches`) are NOT modified.

**Rationale**: FR-006 explicitly scopes the change to `intake_matches` population only.
Live search already returns results in real time and its consumer (the user viewing results)
is in control of what they see. Pre-computed matches represent a system decision, hence the
stricter filter.
