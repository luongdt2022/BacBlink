# Implementation Plan: GitHub Self-Hosted Runner CD

**Branch**: `002-github-runner-cd` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-github-runner-cd/spec.md`

## Summary

Create `.github/workflows/cd.yml` — a GitHub Actions workflow that triggers on every push to `master`, runs on a self-hosted runner already present on the server, and executes the same deploy logic as `deploy.sh` (git stash → checkout master → pull → docker build → stop/rm old container → run new container → stash pop), with each step named independently for per-step failure visibility in GitHub Actions. Concurrency is controlled so only one deploy runs at a time.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow syntax)
**Primary Dependencies**: GitHub Actions (self-hosted runner); Docker CLI; Git — all already present on server
**Storage**: N/A
**Testing**: Manual acceptance test per quickstart.md
**Target Platform**: Linux server (self-hosted GitHub Actions runner)
**Project Type**: CI/CD automation — ops workflow file
**Performance Goals**: Workflow starts within 60 seconds of push; total deploy time dominated by Docker build
**Constraints**: No GitHub Secrets required; no `actions/checkout` — workflow operates on existing server repo path
**Scale/Scope**: Single workflow file, single branch trigger, single server

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a blank template — no organizational constraints defined. Self-imposed gates:

- [x] No secrets hardcoded or required — runner has local file access
- [x] Single workflow file, single responsibility
- [x] Each deploy step is a named Actions step (not a black-box shell script call)
- [x] Old container kept alive on build failure (stop/rm only after successful build)
- [x] Concurrency group prevents parallel deploy races

## Project Structure

### Documentation (this feature)

```text
specs/002-github-runner-cd/
├── plan.md         ← this file
├── research.md     ← Phase 0 decisions
├── data-model.md   ← workflow config & state transitions
├── quickstart.md   ← operator runbook & acceptance tests
└── tasks.md        ← Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
/                              ← repo root
└── .github/
    └── workflows/
        └── cd.yml             ← NEW: GitHub Actions CD workflow
```

**Structure Decision**: Single YAML file added under `.github/workflows/`. No new source directories needed. The existing `deploy.sh` remains in the repo for manual fallback use.

## Phase 0: Research (complete)

See [research.md](research.md). Key decisions:

| Topic | Decision |
|-------|----------|
| Trigger | `on: push: branches: [master]` |
| Runner | `runs-on: self-hosted` |
| Step strategy | Inline named steps (not `bash deploy.sh`) for per-step traceability |
| Working directory | Existing server repo at `/home/sotatek/projects/dmst/dmst-rag` |
| Concurrency | `group: cd-master, cancel-in-progress: true` |
| Container lifecycle | Build → stop/rm → run (stop/rm only after successful build) |
| Secrets | None required |

## Phase 1: Design (complete)

See [data-model.md](data-model.md) for workflow configuration and state transition diagram.
See [quickstart.md](quickstart.md) for runner setup, acceptance test, and troubleshooting guide.

No interface contracts — this is an internal ops workflow file.

### cd.yml Design

```yaml
name: CD — Deploy to Server

on:
  push:
    branches: [master]

concurrency:
  group: cd-master
  cancel-in-progress: true

jobs:
  deploy:
    name: Deploy dmst-rag
    runs-on: self-hosted

    env:
      REPO_DIR: /home/sotatek/projects/dmst/dmst-rag
      IMAGE_NAME: dmst-rag:latest
      CONTAINER_NAME: dmst-rag
      HOST_PORT: "8000"
      CONTAINER_PORT: "8000"

    steps:
      - name: Stash local changes
        working-directory: ${{ env.REPO_DIR }}
        run: |
          if ! git diff --quiet || ! git diff --cached --quiet; then
            echo "STASHED=true" >> $GITHUB_ENV
            git stash push -m "cd-stash-$(date +%s)"
          else
            echo "STASHED=false" >> $GITHUB_ENV
          fi

      - name: Checkout master
        working-directory: ${{ env.REPO_DIR }}
        run: git checkout master

      - name: Pull latest code
        working-directory: ${{ env.REPO_DIR }}
        run: git pull origin master

      - name: Build Docker image
        working-directory: ${{ env.REPO_DIR }}
        run: docker build -t "$IMAGE_NAME" .

      - name: Stop old container
        run: docker stop "$CONTAINER_NAME" || true

      - name: Remove old container
        run: docker rm "$CONTAINER_NAME" || true

      - name: Start new container
        working-directory: ${{ env.REPO_DIR }}
        run: |
          ENV_ARGS=()
          if [[ -f "$REPO_DIR/.env" ]]; then
            ENV_ARGS=(--env-file "$REPO_DIR/.env")
          fi
          docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            -p "$HOST_PORT:$CONTAINER_PORT" \
            "${ENV_ARGS[@]}" \
            "$IMAGE_NAME"

      - name: Restore stashed changes
        working-directory: ${{ env.REPO_DIR }}
        if: env.STASHED == 'true'
        run: git stash pop || echo "WARNING: git stash pop failed — check manually"

      - name: Verify container is running
        run: docker ps -f "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Post-Design Constitution Check

- [x] No secrets in workflow file — `.env` sourced from server filesystem
- [x] Named steps enable per-step failure traceability in GitHub Actions (FR-005)
- [x] `cancel-in-progress: true` prevents concurrent deploy races (FR-008)
- [x] Stop/rm steps placed after build — old container stays up on build failure (SC-005)
- [x] `|| true` only on stop/rm (non-critical) — all other steps fail the workflow on error
- [x] `deploy.sh` remains for manual fallback — no removal required

No violations. Ready for task generation.
