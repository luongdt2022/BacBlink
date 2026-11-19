# Implementation Plan: GitHub Actions CD — Self-Hosted Runner

**Branch**: `001-github-actions-cd` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-github-actions-cd/spec.md`

## Summary

Set up a Continuous Deployment pipeline using GitHub Actions with a self-hosted runner
(label: `backend`) that automatically deploys the DMST backend to the production server at
`/home/sotatek/projects/dmst/dmst-backend` on every push to `main`. The pipeline: pulls
latest code → builds Docker image → recreates only the `backend_app` container → runs
TypeORM migrations inside the container. Alongside, the `docker-compose.yml` is updated to
declare an explicit named network (`dmst_network`) shared by all four services.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax), Shell (Docker/git commands)
**Primary Dependencies**: GitHub Actions (self-hosted runner), Docker Compose v2, Git
**Storage**: N/A (pipeline config only; database managed by existing TypeORM migrations)
**Testing**: Manual — trigger via `git push origin main`, inspect GitHub Actions UI
**Target Platform**: Linux server (self-hosted runner, Ubuntu/Debian assumed)
**Project Type**: CI/CD pipeline configuration + Docker Compose update
**Performance Goals**: Full pipeline completes within 10 minutes
**Constraints**: Runner must have `docker` group access; `.env` must pre-exist on server;
`docker compose` v2 plugin required (not legacy `docker-compose`)
**Scale/Scope**: Single production environment, single runner, 4 containerised services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Module Cohesion & Domain Ownership | ✅ N/A | No NestJS modules touched |
| II. API Contract Stability | ✅ N/A | No API endpoints added or changed |
| III. Async AI Pipeline Integrity | ✅ N/A | No AI pipeline involvement |
| IV. Migration-Gated Schema Changes | ✅ PASS | Pipeline runs `migration:run:prod`; no direct schema changes |
| V. Simplicity & Minimal Complexity | ✅ PASS | Single workflow file, minimal steps, no abstractions |

**Result: All gates pass. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/001-github-actions-cd/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── workflow-contract.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── deploy.yml          # NEW: CD workflow

docker-compose.yml          # MODIFIED: add dmst_network to all services
```

**Structure Decision**: Infrastructure-only change. No `src/` modifications. The workflow
file lives in `.github/workflows/` (GitHub's required location). The Compose file is at the
repo root. `Dockerfile` requires no changes.

## Complexity Tracking

> No constitution violations — table not required.
