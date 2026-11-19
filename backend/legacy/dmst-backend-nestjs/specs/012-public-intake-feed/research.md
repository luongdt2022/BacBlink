# Research: Public Intake Feed

**Feature**: 012-public-intake-feed  
**Date**: 2026-04-03

## Decision 1: Use an authenticated `/my/intakes/discover` route

**Decision**: Expose the feed as an authenticated route under `/my/intakes/discover`.

**Rationale**: The feature must exclude the requesting user's own intakes, which requires authenticated user context. Placing the route under `/my/*` aligns with the constitution's guard rule (`JwtAuthGuard` for `/my/*`) and keeps the contract separate from the existing public `/intakes` route whose current semantics are broader.

**Alternatives considered**:
- Reuse `GET /intakes` and silently change its behavior → Rejected: would be a breaking contract change for current public consumers
- Add a new public route like `GET /intakes/discover` → Rejected: exclusion of requester-owned records is undefined without authenticated identity

---

## Decision 2: Reuse `QueryIntakeDto` unchanged

**Decision**: The discovery endpoint will reuse the existing `QueryIntakeDto` for `type`, `sectorId`, `search`, `page`, and `limit` instead of introducing a new DTO.

**Rationale**: The desired behavior is intentionally similar to `GET /my/intakes`, and the existing DTO already captures the required filters with validation and pagination rules. Reusing it satisfies Principle V by avoiding a duplicate contract type for the same query surface.

**Alternatives considered**:
- Create a dedicated `DiscoverIntakesDto` → Rejected: duplicates existing validation rules without adding distinct behavior
- Accept raw query parameters without DTO validation → Rejected: loses consistency with the rest of the module and weakens contract enforcement

---

## Decision 3: Discovery response uses the standard paginated list shape only

**Decision**: The endpoint returns `{ success: true, data, total, page, limit, totalPages }` and does not include `totalByStatus`.

**Rationale**: The constitution requires the stable paginated list shape. Unlike `GET /my/intakes`, the discovery feed only exposes one fixed status (`published`), so status aggregates add no value and would create unnecessary payload noise. The simpler contract is easier for the client to consume and still satisfies all feature requirements.

**Alternatives considered**:
- Mirror `GET /my/intakes` exactly and include `totalByStatus` → Rejected: misleading because the feed never returns drafts and has no user-controlled status dimension
- Nest pagination metadata inside another `data` object → Rejected: inconsistent with existing controller patterns

---

## Decision 4: Implement as a focused service query, not a generalized list abstraction

**Decision**: Add a dedicated service method for the discovery query, reusing the existing query-builder style already present in `IntakesService`.

**Rationale**: Current list behaviors differ in meaningful ways: admin list includes deleted records and both statuses, personal list filters by owner and exposes `totalByStatus`, public list is currently broad, and discovery must enforce `published` plus owner exclusion. A small dedicated method is simpler and clearer than prematurely extracting a generic list builder with many flags.

**Alternatives considered**:
- Refactor all list endpoints into a large shared query helper first → Rejected: adds complexity without evidence of repeated pain across multiple callers
- Duplicate controller-side filtering after fetching records → Rejected: inefficient and risks incorrect totals/pagination

---

## Decision 5: No schema or migration changes

**Decision**: Reuse the existing `Intake` entity and related joins; no database schema changes are needed.

**Rationale**: The feature only changes which existing rows are visible to a particular authenticated caller. All required data already exists in `intakes`, `users`, `intake_sectors`, and attachments relations.

**Alternatives considered**:
- Add a new visibility flag or derived table for discovery → Rejected: unnecessary for a query-only feature and would violate Principle IV by creating avoidable migration work
