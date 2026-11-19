---
description: "Task list for Explicit Env File for Docker Compose Deployment"
---

# Tasks: Explicit Env File for Docker Compose Deployment

**Input**: Design documents from `specs/002-compose-env-file/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

## Phase 1: docker-compose.yml — Fail-Fast Env File (US1)

- [x] T001 [US1] Change `required: false` to `required: true` in the `backend_app.env_file` block in `docker-compose.yml`

## Phase 2: deploy.yml — Explicit --env-file Flag (US2)

- [x] T002 [US2] Add `--env-file .env` to the `docker compose build backend_app` command in `.github/workflows/deploy.yml`
- [x] T003 [US2] Add `--env-file .env` to the `docker compose up -d --no-deps --force-recreate backend_app` command in `.github/workflows/deploy.yml`

## Phase 3: Validation

- [x] T004 Verify changes with quickstart.md steps: grep env_file in docker-compose.yml, grep --env-file in deploy.yml
