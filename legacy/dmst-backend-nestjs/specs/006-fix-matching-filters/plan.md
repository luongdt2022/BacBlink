# Implementation Plan: Matching Filter — Cross-User & Published Only

**Branch**: `006-fix-matching-filters` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-fix-matching-filters/spec.md`

## Summary

Update `IntakesService.computeMatches()` to apply two new filters on top of the existing
`matchingAuto` gate: (1) exclude the source intake owner's own intakes from candidates, and
(2) exclude any candidate intake with `status=draft`. Both filters are implemented as a
single PostgreSQL post-filter query on the IDs returned by Elasticsearch — no ES index
changes and no schema migration required.

## Technical Context

**Language/Version**: TypeScript / Node.js 22, NestJS 11
**Primary Dependencies**: TypeORM (PostgreSQL) — `In` operator for batch ID lookup
**Storage**: PostgreSQL — read-only filter on existing `intakes` table fields (`user_id`, `status`)
**Testing**: Manual via SQL queries (see `quickstart.md`); no unit test changes required
**Target Platform**: NestJS backend (same server)
**Project Type**: Bug fix / behaviour correction in existing service method
**Performance Goals**: Post-filter adds ≤1 extra DB query per `computeMatches` invocation (batch lookup by IDs)
**Constraints**: Must preserve existing behaviour for seed/admin intakes (userId=null); no ES re-indexing
**Scale/Scope**: 1 service method modification, ~15 lines of code added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion & Domain Ownership | ✅ PASS | Change is entirely within `IntakesService.computeMatches`; no new cross-module imports |
| II. API Contract Stability | ✅ PASS | No public routes changed; internal pipeline logic only |
| III. Async AI Pipeline Integrity | ✅ PASS | `computeMatches` remains fire-and-forget; filters added within the same async scope |
| IV. Migration-Gated Schema Changes | ✅ PASS | No schema changes — existing `user_id` and `status` fields are used |
| V. Simplicity & Minimal Complexity | ✅ PASS | Single method edit; post-filter chosen over ES enrichment to minimise scope |

**Result: All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-matching-filters/
├── plan.md        # This file
├── research.md    # Phase 0 output
├── data-model.md  # Phase 1 output (no new entities)
├── quickstart.md  # Phase 1 output
└── tasks.md       # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/intakes/
└── intakes.service.ts   # MODIFIED — computeMatches() post-filter added
```

**Structure Decision**: Single-file edit within the existing `IntakesModule`. No new files,
no migration, no ES mapping changes.

## Complexity Tracking

> No constitution violations — table not required.
