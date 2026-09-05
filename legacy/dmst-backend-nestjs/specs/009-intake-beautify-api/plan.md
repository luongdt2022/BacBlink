# Implementation Plan: Intake AI Beautification Endpoint

**Branch**: `009-intake-beautify-api` | **Date**: 2026-03-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/009-intake-beautify-api/spec.md`

## Summary

Add a synchronous, on-demand AI beautification endpoint for intakes. A single
`IntakesService.beautifyIntake(intakeId, userId?)` method calls the existing B2B
marketing LLM prompt, persists `aiProcessTitle` + `aiProcessedContent`, and returns the
updated values. Two controller actions expose the method: `POST /my/intakes/:id/beautify`
(user, ownership-checked) and `POST /admin/intakes/:id/beautify` (admin, unrestricted).

## Technical Context

**Language/Version**: TypeScript / Node.js 22, NestJS 11
**Primary Dependencies**: TypeORM (PostgreSQL), `AiService.completion()`, `buildB2bMarketingPrompt`, existing `JwtAuthGuard` / `AdminAuthGuard`
**Storage**: PostgreSQL — update `ai_process_title`, `ai_processed_content`, `ai_processing_status` on existing `intakes` table
**Testing**: Manual via curl / Swagger (quickstart.md)
**Target Platform**: NestJS backend (same server)
**Project Type**: Feature addition — new endpoint on existing module
**Performance Goals**: Synchronous LLM call; p95 latency driven by OpenAI/OpenRouter (~2-5 s); no DB performance concern
**Constraints**: Must not trigger chunk-embed or matching pipeline; must respect existing ownership pattern
**Scale/Scope**: 1 service method + 2 controller actions; no new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion & Domain Ownership | ✅ PASS | New `beautifyIntake` method in `IntakesService`; controllers call service, no repo access from controllers |
| II. API Contract Stability | ✅ PASS | New POST routes; `{ success, data }` envelope; `JwtAuthGuard` on `/my/*`, `AdminAuthGuard` on `/admin/*` |
| III. Async AI Pipeline Integrity | ✅ PASS | This is an explicit user-triggered synchronous action, not a background pipeline step; no pipeline integrity concern |
| IV. Migration-Gated Schema Changes | ✅ PASS | No schema changes — existing columns used |
| V. Simplicity & Minimal Complexity | ✅ PASS | One service method reusing existing `aiService.completion()` and `buildB2bMarketingPrompt`; no new abstraction |

**Result: All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/009-intake-beautify-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── beautify-api.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/intakes/
├── intakes.service.ts          # MODIFIED — add beautifyIntake(intakeId, userId?)
├── admin-intakes.controller.ts # MODIFIED — add POST :id/beautify
└── user-intakes.controller.ts  # MODIFIED — add POST :id/beautify in MyIntakesController
```

**Structure Decision**: All changes within the existing `IntakesModule`. No new files,
no new controller classes, no migration.

## Complexity Tracking

> No constitution violations — table not required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
