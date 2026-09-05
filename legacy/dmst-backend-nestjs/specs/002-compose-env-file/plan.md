# Implementation Plan: Explicit Env File for Docker Compose Deployment

**Branch**: `002-compose-env-file` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-compose-env-file/spec.md`

## Summary

Two targeted changes to make env file loading explicit and fail-safe in the deployment
pipeline: (1) change `env_file.required: false → true` in `docker-compose.yml` so a missing
`.env` causes an immediate failure, and (2) add `--env-file .env` to the `build` and `up`
commands in `.github/workflows/deploy.yml` so compose-level variable substitution is
explicitly sourced from `.env`.

## Technical Context

**Language/Version**: YAML (Docker Compose v2 syntax, GitHub Actions workflow syntax)
**Primary Dependencies**: Docker Compose v2, GitHub Actions self-hosted runner
**Storage**: N/A
**Testing**: Manual — trigger deployment, inspect container env, test fail-fast
**Target Platform**: Linux server (self-hosted runner)
**Project Type**: Infrastructure configuration fix (2 file edits)
**Performance Goals**: N/A
**Constraints**: `--env-file` goes before the subcommand: `docker compose --env-file .env <cmd>`
**Scale/Scope**: 2 files, 3 line changes total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion & Domain Ownership | ✅ N/A | No NestJS modules touched |
| II. API Contract Stability | ✅ N/A | No API endpoints changed |
| III. Async AI Pipeline Integrity | ✅ N/A | No AI pipeline involvement |
| IV. Migration-Gated Schema Changes | ✅ N/A | No schema changes |
| V. Simplicity & Minimal Complexity | ✅ PASS | 3 line edits, no abstractions |

**Result: All gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/002-compose-env-file/
├── plan.md         # This file
├── research.md     # Phase 0 output
├── data-model.md   # Phase 1 output
├── quickstart.md   # Phase 1 output
└── tasks.md        # Phase 2 output (/speckit.tasks)
```

### Source Code changes (repository root)

```text
docker-compose.yml                   # MODIFIED: env_file required: true
.github/workflows/deploy.yml         # MODIFIED: --env-file .env on build + up
```

**Structure Decision**: Pure config edits — no new files, no new directories.

## Complexity Tracking

> No constitution violations — table not required.
