<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification — all placeholders replaced)

Modified principles: N/A (first fill)

Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check section references updated principles by name
  ✅ .specify/templates/spec-template.md — no structural changes required; spec format already aligns
  ✅ .specify/templates/tasks-template.md — no structural changes required; task phases align
  ✅ .specify/templates/constitution-template.md — source template, not modified

Follow-up TODOs: None — all placeholders resolved.
-->

# DMST Backend Constitution

## Core Principles

### I. Module Cohesion & Domain Ownership

Each NestJS module MUST own its domain exclusively. Cross-module data access MUST go through
the owning module's service — never by importing another module's repository or entity directly.
Modules expose only what is necessary via their public service API.

**Rationale**: Prevents tight coupling that makes refactoring costly and breaks domain boundaries
that are critical to the marketplace's IP/Challenge intake separation.

### II. API Contract Stability

All public-facing routes MUST return consistent response shapes:
- Paginated list endpoints MUST return `{ data[], total, page, limit, totalPages }`.
- Single-resource endpoints MUST return the resource object directly.
- Error responses MUST include a `message` field.

Route guards MUST be applied uniformly: `JwtAuthGuard` for `/my/*`, `AdminGuard` for `/admin/*`,
and unauthenticated access only for explicitly public routes.

**Rationale**: The frontend and potential third-party consumers depend on stable, predictable
contracts. Inconsistent shapes cause silent bugs and integration failures.

### III. Async AI Pipeline Integrity

The 4-step AI pipeline (LLM rewrite → chunk+embed → ES index → compute matches) MUST be
fire-and-forget via BullMQ jobs. No AI processing step MUST block an HTTP response.

Each pipeline step MUST be idempotent: re-running a job on the same intake MUST produce
a consistent final state (upsert, not duplicate).

**Rationale**: AI operations are slow and failure-prone. Blocking HTTP handlers on them degrades
UX and risks timeouts. Idempotency enables safe retries without data corruption.

### IV. Migration-Gated Schema Changes

All database schema changes MUST be delivered via a TypeORM migration generated from entity diffs
(`npm run migration:generate`). Direct schema alterations on production MUST NOT occur.

Seed scripts MUST use idempotent upserts (skip if `title + userId` already exists) so they can
be re-run safely at any time.

**Rationale**: Uncontrolled schema changes break reproducibility across environments and make
rollbacks impossible. Idempotent seeds prevent duplicate data on repeated runs.

### V. Simplicity & Minimal Complexity (NON-NEGOTIABLE)

No abstraction layer, helper, or utility MUST be introduced unless it is required by at least
two distinct consumers in the current codebase. YAGNI applies strictly.

Complexity deviations MUST be documented in the plan's Complexity Tracking table with a
justified rationale and a description of the simpler alternative that was rejected.

**Rationale**: The existing codebase is intentionally lean. Premature abstractions increase
cognitive load and maintenance burden without delivering proportional value.

## Technology Stack

- **Runtime**: Node.js / NestJS 11 (TypeScript)
- **Database**: PostgreSQL via TypeORM; pgvector 1024-dim for embeddings
- **Queue**: Redis + BullMQ (`ai-queue`)
- **Search**: Elasticsearch — hybrid kNN (cosine) + BM25 on `intake_chunks` index
- **Embeddings**: BGE-M3 local server (`BGE_M3_URL`, default `http://localhost:8003`)
- **AI Providers**: OpenAI or OpenRouter (configured via `AI_DEFAULT_PROVIDER`)
- **Auth**: JWT (HS256); guards `JwtAuthGuard`, `AdminGuard`

New dependencies MUST be justified against existing capabilities before introduction.
Prefer built-in NestJS/TypeORM/BullMQ patterns over custom solutions.

## Development Workflow

- **Feature branches**: named `###-feature-name` (sequential numbering per `init-options.json`)
- **Migrations**: MUST accompany any entity change in the same PR
- **Seeding**: All seed scripts live in `src/database/scripts/`; MUST be idempotent
- **AI pipeline triggers**: MUST use `IntakesService.applyAiProcessing()` — never enqueue
  jobs directly from controllers
- **Swagger**: Enabled via `ENABLE_DOCUMENTATION=true`; all new endpoints MUST include
  `@ApiOperation` and response decorators
- **Tests**: Unit tests via Jest (`npm test`); integration tests optional unless explicitly
  requested in the feature spec

## Governance

This constitution supersedes all other development practices documented in this repository.
Any conflict between this document and another guide is resolved in favour of this constitution.

**Amendment procedure**:
1. Open a PR with the proposed change to `.specify/memory/constitution.md`.
2. Increment version according to semantic versioning (MAJOR/MINOR/PATCH per the policy below).
3. Run the `/speckit.constitution` command to propagate changes across dependent templates.
4. The PR description MUST include: motivation, affected principles, and migration impact.

**Versioning policy**:
- **MAJOR**: Removal or incompatible redefinition of a principle.
- **MINOR**: New principle or section added; material expansion of existing guidance.
- **PATCH**: Clarifications, wording, or non-semantic refinements.

**Compliance review**: All PRs MUST verify the Constitution Check section of the relevant
`plan.md` before merge. Complexity deviations require the Complexity Tracking table populated.

Runtime development guidance is maintained in `CLAUDE.md` at the repository root.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
