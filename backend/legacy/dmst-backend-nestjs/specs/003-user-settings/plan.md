# Implementation Plan: Personalized User Settings

**Branch**: `003-user-settings` | **Date**: 2026-03-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-user-settings/spec.md`

## Summary

Add a per-user settings system with an initial `matching_auto` toggle. Each user gets one
settings row (created on first access with defaults). A new `UserSetting` entity and
`UserSettingsService` are added to the existing `UsersModule`. Two authenticated endpoints
(`GET /my/settings`, `PATCH /my/settings`) expose settings to the user. `IntakesService`
is updated to check `matchingAuto` before triggering `computeMatches` at the end of the
AI pipeline.

## Technical Context

**Language/Version**: TypeScript / Node.js 22, NestJS 11
**Primary Dependencies**: TypeORM (PostgreSQL), class-validator, existing `JwtAuthGuard`
**Storage**: PostgreSQL — new `user_settings` table (1 row per user, FK → users)
**Testing**: Manual via curl / Swagger; existing unit test suite unaffected
**Target Platform**: NestJS backend (same server)
**Project Type**: Feature addition to existing NestJS module
**Performance Goals**: Settings read adds ≤1 DB query to the intake pipeline (indexed lookup by `user_id`)
**Constraints**: Must not break existing auto-matching behaviour for intakes without a userId (seed/admin); defaults to match in that case
**Scale/Scope**: 1 new entity, 1 new service, 1 new controller, 1 migration, 1 service modification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion & Domain Ownership | ✅ PASS | `UserSetting` added to `UsersModule`; `IntakesService` accesses settings via `UserSettingsService`, not the repository directly |
| II. API Contract Stability | ✅ PASS | New routes `/my/settings` GET + PATCH; consistent flat response `{ matchingAuto: boolean }` |
| III. Async AI Pipeline Integrity | ✅ PASS | `computeMatches` remains async/fire-and-forget; only the conditional call is added before it |
| IV. Migration-Gated Schema Changes | ✅ PASS | New `user_settings` table delivered via TypeORM migration |
| V. Simplicity & Minimal Complexity | ✅ PASS | Columnar model (not key-value), lazy row creation, no new module |

**Result: All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/003-user-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── settings-api.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/users/
├── user-setting.entity.ts          # NEW
├── dto/
│   └── update-settings.dto.ts      # NEW
├── services/
│   └── user-settings.service.ts    # NEW
├── controllers/
│   └── user-settings.controller.ts # NEW
└── users.module.ts                 # MODIFIED (register new entity/service/controller)

src/intakes/
├── intakes.service.ts              # MODIFIED (check matchingAuto before computeMatches)
└── intakes.module.ts               # MODIFIED (import UsersModule or UserSettingsService)

src/database/migrations/
└── <timestamp>-addUserSettings.ts  # NEW
```

**Structure Decision**: Single-project NestJS layout. Settings added to `UsersModule`
to keep user-domain ownership. No new top-level module introduced.

## Complexity Tracking

> No constitution violations — table not required.
