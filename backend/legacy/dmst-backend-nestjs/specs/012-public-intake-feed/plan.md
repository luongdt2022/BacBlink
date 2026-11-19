# Implementation Plan: Public Intake Feed

**Branch**: `012-public-intake-feed` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)

## Summary

Add one authenticated discovery-list endpoint for intakes that mirrors the filtering and pagination behavior of the current personal intake list, but only returns `published` intakes owned by other users. The implementation stays inside `IntakesModule`, reuses the existing `QueryIntakeDto`, keeps the standard paginated response contract, and introduces no schema or queue changes.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js with NestJS 11  
**Primary Dependencies**: NestJS 11, TypeORM, class-validator, Swagger decorators, existing `JwtAuthGuard`  
**Storage**: PostgreSQL via existing `intakes`, `intake_sectors`, `intake_attachments`, and `users` tables  
**Testing**: Jest via `npm test`; lint via `npm run lint`  
**Target Platform**: Linux-hosted NestJS REST API with global prefix `${API_PREFIX}/${API_VERSION}`  
**Project Type**: Web service (REST API)  
**Performance Goals**: Discovery list should remain in the same performance envelope as existing intake list endpoints; first-page retrieval should support the spec target of confirming content availability within 5 seconds  
**Constraints**: Must use `JwtAuthGuard` because self-exclusion depends on requester identity; must preserve stable paginated list shape; must not expose drafts, deleted intakes, or requester-owned intakes; must avoid new abstractions unless reused  
**Scale/Scope**: 1 new authenticated list endpoint, 1 new service query method or shared query helper, reuse of existing DTO/entity/module wiring, no new dependencies, no migration, no queue changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Module Cohesion & Domain Ownership | ✅ PASS | Feature remains fully inside `IntakesModule`; no cross-module repository access is introduced |
| II — API Contract Stability | ✅ PASS | New route will be guarded with `JwtAuthGuard` under `/my/*` and will return the standard paginated list shape `{ data, total, page, limit, totalPages }` |
| III — Async AI Pipeline Integrity | ✅ PASS | Feature is read-only list retrieval; no AI pipeline or queue behavior changes |
| IV — Migration-Gated Schema Changes | ✅ PASS | No entity or schema changes are planned, so no migration is required |
| V — Simplicity & Minimal Complexity | ✅ PASS | Reuses existing DTOs, entity relations, and query-building patterns; no new module or abstraction is justified |

## Project Structure

### Documentation (this feature)

```text
specs/012-public-intake-feed/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── public-intake-feed-api.md
└── tasks.md
```

### Source Code (affected files)

```text
src/intakes/
├── user-intakes.controller.ts   ← add new authenticated discovery endpoint under /my/intakes
├── intakes.service.ts           ← add discovery query for published intakes owned by other users
└── dto/
    └── intake.dto.ts            ← reused as-is for query validation and pagination

src/main.ts                      ← unchanged; existing global API prefix applies
```

**Structure Decision**: Single NestJS backend project under `src/`. The feature is an incremental change to the existing intakes domain, so documentation lives under `specs/012-public-intake-feed/` and code changes stay within `src/intakes/`.

## Phase 0 Research Summary

- Keep the feature inside `IntakesModule` rather than creating a separate module because it is only another read model over existing intake data.
- Use an authenticated `/my/*` route so ownership exclusion is reliable and guard behavior follows the constitution.
- Return the standard paginated list contract without `totalByStatus`, because the feed only exposes one fixed status (`published`) and the extra aggregate provides no user value here.

## Phase 1 Design Summary

- Reuse `QueryIntakeDto` for `type`, `sectorId`, `search`, `page`, and `limit`.
- Add one service query specialized for `status = published` and `userId != requester`.
- Reuse existing intake relations already used by list endpoints so discovery items expose the same list-ready metadata.
- Document one REST contract and one manual validation flow; no schema artifact is required beyond describing the reused entity/view model.

## Post-Design Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Module Cohesion & Domain Ownership | ✅ PASS | Only `IntakesService` and `MyIntakesController` are touched; data remains owned by `IntakesModule` |
| II — API Contract Stability | ✅ PASS | Route stays under `/my/*` with `JwtAuthGuard`; response remains the standard paginated list envelope |
| III — Async AI Pipeline Integrity | ✅ PASS | No queue, processor, or AI pipeline path is modified |
| IV — Migration-Gated Schema Changes | ✅ PASS | No database schema changes introduced |
| V — Simplicity & Minimal Complexity | ✅ PASS | No new module, dependency, or helper layer added; a focused service query is sufficient |

## Complexity Tracking

No constitution violations or complexity deviations are expected for this feature.
